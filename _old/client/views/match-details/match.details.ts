/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/competition/:competitionName/matches/:matchId")
    .setRequiresAuthentication(false)
    .setTemplateUrl("client/views/match-details/match.details.ng.html")
    .setVisible(false)
    .setStateName("website.matchDetail")
    .setControllerName("MatchDetailsController")
);


class MatchDetailsController {

    @Autowired
    private competitionMatchesService: CompetitionMatchesService;

    @Autowired
    private betsService: BetsService;

    static $inject = ["$scope", "$stateParams", "$timeout"];
    constructor(protected $scope: any, private $stateParams: angular.ui.IStateParamsService, private $timeout: angular.ITimeoutService) {
        $scope.vm = this;
        $scope._ = _;
        $scope.isMobile = Utils.isMobile();
        $scope.loading = true;
        $scope.statistics = {
            averagePoints: 0,
            totalPointHits: 0
        };
        $scope.competitionName = $stateParams["competitionName"];

        if ($stateParams["matchId"] === undefined) {
            NotificationService.instance().popup.error("No matchId name given!");
            return;
        }

        this.loadMatch($stateParams["matchId"])
        this.loadBets($stateParams["matchId"]);
        $scope.loading = false;

        // load devices
        DevicesService.instance().getMyDevices({}, { reactive: true }).subscribe((cursor) => {
            let devices: Device[] = cursor.fetch();
            this.$timeout(() => {
                this.$scope.devices = devices;
            });
        });
    }


    private loadMatch(matchId: string) {
        var query: QueryObject<CompetitionMatch> = this.competitionMatchesService.getCompetitionMatchById({ id: matchId }, { reactive: true });
        query.subscribe(() => {
            query.expand(["teamIds.linkedUserIds", "competitionId"], () => {
                Tracker.autorun(() => {
                    let match: CompetitionMatch = <CompetitionMatch>query.val(0);
                    let competition: Competition = match.getCompetition().val(0);
                    this.$timeout(() => {
                        this.$scope.match = match;
                        this.$scope.allowRating = _.indexOf(this.$scope.match.ratedByIds, Meteor.userId()) === -1;
                        this.$scope.isAdministrator = competition.isAdministrator(Meteor.userId());
                        this.$scope.isManualCompetition = competition.syncer === undefined;
                    });
                    competition.getPreviousMatch(match.index, (competitionMatch: CompetitionMatch) => {
                        this.$timeout(() => {
                            this.$scope.previousMatch = competitionMatch;
                        });
                    });
                    competition.getNextMatch(match.index, (competitionMatch: CompetitionMatch) => {
                        this.$timeout(() => {
                            this.$scope.nextMatch = competitionMatch;
                        });
                    });
                });
            });
        });
    }

    private loadBets(matchId: string) {
        var query: QueryObject<Bet> = this.betsService.getBetsForMatchId({ matchId: matchId });
        query.subscribe(() => {
            query.expand([BetsCollection.expandables.ownerId], () => {
                this.$scope.bets = query.vals();
                if (this.$scope.bets instanceof Array && this.$scope.bets.length > 0) {
                    this.$scope.statistics.averagePoints = 0;
                    this.$scope.statistics.totalPointHits = 0;
                    _.each(this.$scope.bets, (bet: Bet) => {
                        this.$scope.statistics.averagePoints += bet.points;
                        if (bet.points === this.$scope.match.maxPoints)
                            this.$scope.statistics.totalPointHits++;
                    });
                    this.$scope.statistics.averagePoints /= this.$scope.bets.length;
                    this.$scope.statistics.averagePoints = Math.round(this.$scope.statistics.averagePoints * 10) / 10;
                } else
                    this.$scope.statistics.averagePoints = 0;
            });
        });
    }

    public useDevice(device: Device) {
        device.useDeviceForMatch(this.$scope.match.id);
    }



}

smallstack.angular.app.controller("MatchDetailsController", MatchDetailsController);
