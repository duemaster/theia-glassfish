/**
 * Generated using theia-extension-generator
 */

import { GlassFishExtensionCommandContribution, GlassFishExtensionMenuContribution } from './glassfish-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    
    bind(CommandContribution).to(GlassFishExtensionCommandContribution);
    bind(MenuContribution).to(GlassFishExtensionMenuContribution);
});