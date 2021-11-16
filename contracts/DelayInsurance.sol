//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

import "hardhat/console.sol";

contract DelayInsurance is ChainlinkClient, KeeperCompatibleInterface {
    using Chainlink for Chainlink.Request;

    enum PolicyStatus {
        CREATED, // Policy is subscribed
        RUNNING, // Policy cover is started
        COMPLETED, // Policy cover is finished without claim
        CLAIMED, // Policy is claimed, waiting for pay out
        PAIDOUT // Claim is paid out
    }

    struct Coordinate {
        string lat;
        string lng;
    }

    struct Ship {
        string id;
        uint256 shipmentValue;
    }

    struct Coverage {
        address beneficiary;
        uint256 startDate;
        uint256 endDate;
        uint256 startPort;
        uint256 endPort;
        uint256 premium;
        uint256 coverageAmount;
        uint256 gustThreshold;
        PolicyStatus status;
    }

    struct TrackingData {
        uint256 requestId;
        Coordinate location;
    }

    struct WeatherData {
        uint256 requestId;
        Coordinate location;
        uint256 gust;
    }

    struct Policy {
        uint256 policyId;
        Ship ship;
        Coverage coverage;
    }

    event PolicySubscription(address indexed beneficiary, uint256 indexed id);

    uint256 public lastTimeStamp;

    //Policy[] public policies;
    mapping(address => Policy) public policies;
    Policy[] public upcomingPolicies;

    address public admin;
    uint256 public policyId;
    address public weatherOracle;
    bytes32 public weatherJobId;
    uint256 public weatherFee;
    address public trackingOracle;
    bytes32 public trackingJobId;
    uint256 public trackingFee;

    // Prevents a function being run unless it's called by Insurance Provider
    modifier onlyOwner() {
        require(admin == msg.sender, "Only Insurance provider can do this");
        _;
    }

    constructor() public {
        admin = msg.sender;
        // Error on tests -> Transaction reverted: function call to a non-contract account
        //setPublicChainlinkToken();
    }

    /**********  PUBLIC FUNCTIONS **********/

    function subscribePolicy(
        string memory _shipId,
        uint256 _shipmentValue,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _startPort,
        uint256 _endPort
    ) public payable {
        Ship memory ship = Ship({id: _shipId, shipmentValue: _shipmentValue});

        uint256 _premium = pricePremium(
            ship,
            _startDate,
            _endDate,
            _startPort,
            _endPort
        );

        require(_premium == msg.value, "You have to pay the exact Premium");

        uint256 _gustThreshold = calculateGustThreshold(
            ship,
            _startDate,
            _endDate,
            _startPort,
            _endPort
        );

        Coverage memory coverage = Coverage({
            beneficiary: msg.sender,
            startDate: _startDate,
            endDate: _endDate,
            startPort: _startPort,
            endPort: _endPort,
            premium: _premium,
            coverageAmount: _shipmentValue,
            gustThreshold: _gustThreshold,
            status: PolicyStatus.CREATED
        });

        Policy memory policy = Policy({
            policyId: policyId,
            ship: ship,
            coverage: coverage
        });

        policies[msg.sender] = policy;
        upcomingPolicies.push(policy);
        emit PolicySubscription(msg.sender, policyId);
        policyId++;
    }

    function getPolicy(address beneficiary)
        public
        view
        returns (Policy memory)
    {
        return policies[msg.sender];
    }

    /**********  PROTOCOL FUNCTIONS **********/

    // Set up ship tracking oracle datas
    function setTrackingOracle(
        address _oracleAddress,
        bytes32 _jobId,
        uint256 _fee
    ) public onlyOwner {
        trackingOracle = _oracleAddress; // address :
        trackingJobId = _jobId; // jobId  :
        trackingFee = _fee; // fees : X.X LINK
    }

    // Set up weather oracle datas
    function setWeatherOracle(
        address _oracleAddress,
        bytes32 _jobId,
        uint256 _fee
    ) public onlyOwner {
        weatherOracle = _oracleAddress; // address :
        weatherJobId = _jobId; // jobId  :
        weatherFee = _fee; // fees : X.X LINK
    }

    /**********  ORACLES FUNCTIONS **********/

    // // Create a Chainlink request to retrieve API response, find the target (https://docs.chain.link/docs/make-a-http-get-request/) (TO DO)
    // function requestTrackingData() public returns (bytes32 requestId) {
    //     Chainlink.Request memory request = buildChainlinkRequest(trackingJobId, address(this), this.fulfill.selector);
    //     // GET & PATH REQUEST
    //     request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
    //     request.add("path", "RAW.ETH.USD.VOLUME24HOUR");
    //     int timesAmount = 10**18; // Multiply the result by 10**18 to remove decimals
    //     request.addInt("times", timesAmount);
    //
    //     return sendChainlinkRequestTo(trackingOracle, request, trackingFee);
    // }
    //
    // // Receive the response in the form of uint256 (TO DO)
    // uint256 resultTracking;
    // function receiveTackingData(bytes32 _requestId, uint256 _location) public recordChainlinkFulfillment(_requestId) {
    //   resultTracking = _location;
    // }
    //
    //
    // // Create a Chainlink request to retrieve API response, find the target (https://docs.chain.link/docs/make-a-http-get-request/) (TO DO)
    // function requestWeatherData() public returns (bytes32 requestId) {
    //     Chainlink.Request memory request = buildChainlinkRequest(weatherJobId, address(this), this.fulfill.selector);
    //     // GET & PATH REQUEST
    //     request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
    //     request.add("path", "RAW.ETH.USD.VOLUME24HOUR");
    //     int timesAmount = 10**18; // Multiply the result by 10**18 to remove decimals
    //     request.addInt("times", timesAmount);
    //
    //     return sendChainlinkRequestTo(weatherOracle, request, weatherFee);
    // }
    //
    // // Receive the response in the form of uint256 (TO DO)
    // uint256 resultWeather;
    // function receiveWeatherData(bytes32 _requestId, uint256 _location) public recordChainlinkFulfillment(_requestId) {
    //   resultWeather = _location;
    // }

    /**********  PRICING FUNCTIONS **********/

    // Calculate the premium
    function pricePremium(
        Ship memory _ship,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _startPort,
        uint256 _endPort
    ) public payable returns (uint256) {
        return _ship.shipmentValue / 200; // Hardvalue for a catnat event (occure 1/200)
    }

    // Calculate the gust threshold, above the threshold, the insurer pay out
    function calculateGustThreshold(
        Ship memory _ship,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _startPort,
        uint256 _endPort
    ) public payable returns (uint256) {
        return 100;
    }

    /**********  CLAIMS FUNCTIONS **********/
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        //uint interval = 3600; //one hour
        uint256 interval = 60; // Interval in seconds
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        lastTimeStamp = block.timestamp;
        verifyIncidents();
    }

    // TODO make this function internal
    function verifyIncidents() public onlyOwner {
        for (
            uint256 policiesIndex = 0;
            policiesIndex < upcomingPolicies.length;
            policiesIndex++
        ) {
            if (upcomingPolicies[policiesIndex].coverage.startDate >= block.timestamp && 
                  upcomingPolicies[policiesIndex].coverage.endDate < block.timestamp) {
      
                policies[upcomingPolicies[policiesIndex].coverage.beneficiary].coverage.status = PolicyStatus.RUNNING;

                //TODO verify if any incidents occured (if insurance claim process can be trigger)
                if (true) {
                  // WIP
                }

            } else if (upcomingPolicies[policiesIndex].coverage.endDate > block.timestamp) {
              policies[upcomingPolicies[policiesIndex].coverage.beneficiary].coverage.status = PolicyStatus.COMPLETED;
              delete upcomingPolicies[policiesIndex];
            }
        }
    }
}
