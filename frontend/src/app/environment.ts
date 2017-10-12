/**
 * Angular 2
 */
declare var ENV: string;

import { ApplicationRef, enableProdMode } from "@angular/core";
import { disableDebugTools, enableDebugTools } from "@angular/platform-browser";
import { IOC, ConfigurationService } from "@smallstack/common";

/**
 * Environment Providers
 */
let PROVIDERS: any[] = [
    /**
     * Common env directives
     */
];

/**
 * Angular debug tools in the dev console
 * https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
 */
let _decorateModuleRef = <T>(value: T): T => { return value; };

if ("production" === ENV) {

    IOC.onRegister("configurationService", (configurationService: ConfigurationService) => {
        configurationService.set("smallstack.api.url", "http://smallstack-demo-backend.smallstack.cloud/api");
    });


    enableProdMode();

    /**
     * Production
     */
    _decorateModuleRef = (modRef: any) => {
        disableDebugTools();

        return modRef;
    };

    PROVIDERS = [
        ...PROVIDERS,
        /**
         * Custom providers in production.
         */
    ];

} else {

    IOC.onRegister("configurationService", (configurationService: ConfigurationService) => {
        configurationService.set("smallstack.api.url", "http://localhost:3000/api");
    });


    _decorateModuleRef = (modRef: any) => {
        const appRef = modRef.injector.get(ApplicationRef);
        const cmpRef = appRef.components[0];

        enableDebugTools(cmpRef);
        return modRef;
    };

    /**
     * Development
     */
    PROVIDERS = [
        ...PROVIDERS,
        /**
         * Custom providers in development.
         */
    ];

}

export const decorateModuleRef = _decorateModuleRef;

export const ENV_PROVIDERS = [
    ...PROVIDERS
];
