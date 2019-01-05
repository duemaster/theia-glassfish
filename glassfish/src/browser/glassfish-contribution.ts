import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService, MAIN_MENU_BAR, Command } from "@theia/core/lib/common";

export namespace GlassFishMenu {
    //Some Magic String concerning placement order in menu
    const glassFishString = "5_glassfish";

    export const GlassFish = [...MAIN_MENU_BAR, glassFishString];
    export const GlassFish_START = [...GlassFish, glassFishString];
    export const GlassFish_STOP = [...GlassFish, glassFishString];
}

export namespace GlassFishCommands {
    const GLASSFISH_CATEGORY = "GlassFish"

    export const START_SERVER: Command = {
        id: 'glassfish:start',
        category: GLASSFISH_CATEGORY,
        label: 'Start GlassFish Server'
    }

    export const STOP_SERVER: Command = {
        id: 'glassfish:stop',
        category: GLASSFISH_CATEGORY,
        label: 'Stop GlassFish Server'
    }
}

@injectable()
export class GlassFishExtensionCommandContribution implements CommandContribution {

    //Need to Save in Cookie Later + Periodic Refresh
    isServerStarted: boolean = false;

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {

        registry.registerCommand(GlassFishCommands.START_SERVER, {
            execute: async () => {
                this.messageService.info("Starting GlassFish Server")
                this.isServerStarted = true;
                this.messageService.info("GlassFish Server Started Successfully")
            },
            isEnabled: () => !this.isServerStarted
        })

        registry.registerCommand(GlassFishCommands.STOP_SERVER, {
            execute: () => {
                this.messageService.info("Stopping GlassFish Server");
                this.isServerStarted = false;
                this.messageService.info("GlassFish Server Stopped Successfully")
            },
            isEnabled: () => this.isServerStarted
        })
    }
}

@injectable()
export class GlassFishExtensionMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {

        menus.registerSubmenu(GlassFishMenu.GlassFish, "GlassFish");

        menus.registerMenuAction(GlassFishMenu.GlassFish_START, {
            commandId: GlassFishCommands.START_SERVER.id,
            label: 'Start GlassFish Server',
            order: '0'
        });

        menus.registerMenuAction(GlassFishMenu.GlassFish_STOP, {
            commandId: GlassFishCommands.STOP_SERVER.id,
            label: 'Stop GlassFish Server',
            order: '1'
        })

    }
}