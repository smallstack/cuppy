/// <reference path="../../typedefinitions/generated.d.ts" />
/// <reference path="competitionTypes/LeagueType.ts" />
/// <reference path="competitionTypes/TournamentType.ts" />
/// <reference path="competitionTypes/QuickMatchType.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
    "competitions-startCompetition": function(params: { competitionId: string }) {
        Utils.check(params.competitionId, String, "competitionId");

        var competitionsService: CompetitionsService = CompetitionsService.instance();
        var competitionsRoundsService: CompetitionRoundsService = CompetitionRoundsService.instance();

        // get competition
        var competition: Competition = competitionsService.getCompetitionById({ id: params.competitionId }).cursor.fetch()[0];
        if (!competition)
            throw new Meteor.Error("404", "Could not find the competition you wanted to start!");
        if (!competition.isAdministrator(this.userId))
            throw new Meteor.Error("403", "You are not an administrator of this competition!");

        // delete rounds
        var rounds = CompetitionRoundsService.instance().getAllRoundsForCompetitionId({ competitionId: competition.id }).cursor.fetch();
        _.each(rounds, function(round: CompetitionRound) {
            competitionsRoundsService.deleteRoundRecursive(round);
        });

        // create matches
        switch (competition.type) {
            case Competition.enums.type.LEAGUE:
                new LeagueType().createRoundsAndMatches(competition);
                break;
            case Competition.enums.type.TOURNAMENT:
                new TournamentType().createRoundsAndMatches(competition);
                break;
            case Competition.enums.type.QUICKMATCH:
                new QuickMatchType().createRoundsAndMatches(competition);
                break;
            default:
                throw new Meteor.Error("501", "Could not create matches for competition type '" + competition.type + "' since it is not implemented yet!");
        }

        // set competition to started
        competition.started = true;
        competition.update();
    }
});
