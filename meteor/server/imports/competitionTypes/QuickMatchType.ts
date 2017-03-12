import { ICompetitionType } from "./ICompetitionType";
import { Competition, CompetitionRound, CompetitionRoundsService, CompetitionMatch, CompetitionMatchesService } from "@smallstack/datalayer";
import { Utils } from "@smallstack/core-common";

export class QuickMatchType implements ICompetitionType {

    public createRoundsAndMatches(competition: Competition) {

        var teamCount: number = competition.teamIds.length;
        if (teamCount !== 2)
            throw new Meteor.Error("501", "A Quick Match has to have exactly 2 competition teams!");

        // hinspiel
        var round: CompetitionRound = new CompetitionRound();
        round.name = Utils.createUrlConformIdFromInput("first round");
        round.multiplier = 1;
        round.competitionId = competition.id;
        round.id = CompetitionRoundsService.instance().save(round);
        competition.roundIds.push(round.id);
        competition.update();

        var match: CompetitionMatch = new CompetitionMatch();
        match.competitionId = competition.id;
        match.teamIds = [competition.teamIds[0], competition.teamIds[1]];
        match.roundId = round.id;
        match.index = 0;
        match.id = CompetitionMatchesService.instance().save(match);
        round.matchIds.push(match.id);
        CompetitionRoundsService.instance().update(round);

        // rückspiel
        if (competition.returnRound) {
            var secondRound: CompetitionRound = new CompetitionRound();
            secondRound.name = Utils.createUrlConformIdFromInput("second round");
            secondRound.multiplier = 1;
            secondRound.competitionId = competition.id;
            secondRound.id = CompetitionRoundsService.instance().save(secondRound);
            competition.roundIds.push(secondRound.id);
            competition.update();

            var returnMatch: CompetitionMatch = new CompetitionMatch();
            returnMatch.competitionId = competition.id;
            returnMatch.teamIds = [competition.teamIds[1], competition.teamIds[0]];
            returnMatch.roundId = secondRound.id;
            returnMatch.index = 1;
            returnMatch.id = CompetitionMatchesService.instance().save(returnMatch);
            secondRound.matchIds.push(returnMatch.id);
            CompetitionRoundsService.instance().update(secondRound);
        }

    }
}
