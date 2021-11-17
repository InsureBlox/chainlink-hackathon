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
        address payable beneficiary;
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
        uint8 incidents;
    }

    event PolicySubscription(address indexed beneficiary, uint256 indexed id);
    event IncidentReported(address indexed beneficiary, uint8 indexed actualNumberOfIncidents);
    event PolicyPaidOut(address indexed beneficiary, uint256 indexed id);

    uint256 public lastTimeStamp;

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

    // Threshold for triggering claiming process 
    uint8 public incidentsThreshold = 1;

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
            beneficiary: payable(msg.sender),
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
            coverage: coverage,
            incidents: 0
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
            Policy memory policy = upcomingPolicies[policiesIndex];

            // verify valid policies 
            if (upcomingPolicies[policiesIndex].coverage.startDate <= block.timestamp && 
                  upcomingPolicies[policiesIndex].coverage.endDate > block.timestamp) {
      
                // Update policy status
                policies[policy.coverage.beneficiary].coverage.status = PolicyStatus.RUNNING;

                // TODO call external adapter which will verify if an incident occured based (location + weather)
                if (hasIncident()) {
                    // Update number of incidents
                    policies[policy.coverage.beneficiary].incidents++;
                    uint8 incidents = policies[policy.coverage.beneficiary].incidents;

                    emit IncidentReported(policy.coverage.beneficiary, incidents);

                    // Trigger claiming process using pre determined threshold
                    if (incidents == incidentsThreshold) {
                        payOut(policy.coverage.beneficiary, policy.coverage.premium, policy.policyId);
                    }
                }

            } else if (policy.coverage.endDate >= block.timestamp) {
 
              // Update policy status
              policies[policy.coverage.beneficiary].coverage.status = PolicyStatus.COMPLETED;
              // remove current policy from upcomingPolicies list
              delete policy;
            }
        }
    }

    // Verify incidents via External Adapter
    function hasIncident(/* Input data */) public returns (bool) {
        // TODO add a proper implementation
        return true;
    }

    function payOut(address payable beneficiary, uint256 premium, uint256 policyId) public payable {
        // transfer funds to beneficiary
        (bool sent, bytes memory data) = beneficiary.call{value: premium}("");
        require(sent, "Failed to transfer insurance claim");
        emit PolicyPaidOut(beneficiary, policyId);
    }
}
