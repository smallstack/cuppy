import { IOC } from "smallstack";
import { GeneratedCompetition } from "../generated/models/GeneratedCompetition";

export class Competition extends GeneratedCompetition {

	/**
	 * If you want to you can implement your own model methods here. 
	 * This file only gets generated once and will not get overwritten!
	 * 
	 * You can force overwriting this file by 'smallstack generate --forcedGeneration'
	 */

}

IOC.register("Competition", Competition);
