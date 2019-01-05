import { injectable, inject } from "inversify";
import { 
    CommandContribution, 
    CommandRegistry, 
    MenuContribution, 
    MenuModelRegistry, 
    MessageService, 
    MAIN_MENU_BAR,
    SelectionService,
    Command 
} from "@theia/core/lib/common";
import URI from "@theia/core/lib/common/uri";
import { UriAwareCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import { FileSystem } from '@theia/filesystem/lib/common';

export namespace GlassFishMenu {
    //Some Magic String concerning placement order in menu
    const glassFishString = "5_glassfish";

    export const GlassFish = [...MAIN_MENU_BAR, glassFishString];
    export const GlassFish_START = [...GlassFish, glassFishString];
    export const GlassFish_STOP = [...GlassFish, glassFishString];

    export const GlassFish_NAVIGATOR_CONTEXT_MENU = ['navigator-context-menu', "5_glassfish"]
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

    export const DEPLOY_WAR: Command = {
        id: 'glassfish:deploy_war',
        category: GLASSFISH_CATEGORY,
        label: 'Deploy .war file'
    }

    export const UNDEPLOY_WAR: Command = {
        id: 'glassfish:undeploy_war',
        category: GLASSFISH_CATEGORY,
        label: 'Undeploy .war file'
    }

    export const DEPLOY_JAR: Command = {
        id: 'glassfish:deploy_jar',
        category: GLASSFISH_CATEGORY,
        label: 'Deploy .jar file'
    }

    export const UNDEPLOY_JAR: Command = {
        id: 'glassfish:undeploy_jar',
        category: GLASSFISH_CATEGORY,
        label: 'Undeploy .jar file'
    }
}

@injectable()
export class GlassFishExtensionCommandContribution implements CommandContribution {

    //Need to Save in Cookie Later + Periodic Refresh
    isServerStarted: boolean = false;

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(SelectionService) protected readonly selectionService: SelectionService
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

        registry.registerCommand(GlassFishCommands.DEPLOY_JAR, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                //Returns File Stat
                const stat: any = await this.fileSystem.getFileStat(uri.toString());
                this.messageService.info("Opening: " + stat.uri);
            },
            isVisible: uri => {
                return uri.path.ext == '.jar'
            }
        }))

        registry.registerCommand(GlassFishCommands.UNDEPLOY_JAR, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                const stat = await this.fileSystem.getFileStat(uri.toString());
                this.messageService.info("Undeploy: " + stat);
            },
            isVisible: uri => {
                return uri.path.ext == '.jar'
            }
        }))

        registry.registerCommand(GlassFishCommands.DEPLOY_WAR, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                const stat = await this.fileSystem.getFileStat(uri.toString());
                this.messageService.info("Opening: " + stat);
            },
            isVisible: uri => {
                return uri.path.ext == '.war'
            }
        }))

        registry.registerCommand(GlassFishCommands.UNDEPLOY_WAR, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                const stat = await this.fileSystem.getFileStat(uri.toString());
                this.messageService.info("Undeploy: " + stat);
            },
            isVisible: uri => {
                return uri.path.ext == '.war'
            }
        }))
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

        menus.registerMenuAction(GlassFishMenu.GlassFish_NAVIGATOR_CONTEXT_MENU, {
            commandId: GlassFishCommands.DEPLOY_JAR.id
        })

        menus.registerMenuAction(GlassFishMenu.GlassFish_NAVIGATOR_CONTEXT_MENU, {
            commandId: GlassFishCommands.UNDEPLOY_JAR.id
        })

        menus.registerMenuAction(GlassFishMenu.GlassFish_NAVIGATOR_CONTEXT_MENU, {
            commandId: GlassFishCommands.DEPLOY_WAR.id
        })

        menus.registerMenuAction(GlassFishMenu.GlassFish_NAVIGATOR_CONTEXT_MENU, {
            commandId: GlassFishCommands.UNDEPLOY_WAR.id
        })

    }
}