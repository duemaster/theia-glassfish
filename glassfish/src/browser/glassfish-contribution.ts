import { injectable, inject } from "inversify";
import {
    CommandContribution,
    CommandRegistry,
    MenuContribution,
    MenuModelRegistry,
    MessageService,
    MAIN_MENU_BAR,
    SelectionService,
    Command,
    CommandService
} from "@theia/core/lib/common";
import URI from "@theia/core/lib/common/uri";
import { UriAwareCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import { FileSystem } from '@theia/filesystem/lib/common';
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { MiniBrowserOpenHandler } from "@theia/mini-browser/lib/browser/mini-browser-open-handler"
import { FrontendApplicationStateService } from "@theia/core/lib/browser/frontend-application-state";
import { FrontendApplicationContribution, FrontendApplication } from "@theia/core/lib/browser";


export namespace GlassFishMenu {
    //Some Magic String concerning placement order in menu
    const glassFishString = "5_glassfish";

    export const GlassFish = [...MAIN_MENU_BAR, glassFishString];
    export const GlassFish_START = [...GlassFish, glassFishString];
    export const GlassFish_STOP = [...GlassFish, glassFishString];
    export const GlassFish_BUILD = [...GlassFish, glassFishString];

    export const GlassFish_NAVIGATOR_CONTEXT_MENU = ['navigator-context-menu', glassFishString]
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

    export const ADD_JDBC_RESOURCE: Command = {
        id: 'glassfish:add_resource',
        category: GLASSFISH_CATEGORY,
        label: 'Add JDBC Resources'
    }

    export const BUILD_PROJECT: Command = {
        id: 'glassfish:build_project',
        category: GLASSFISH_CATEGORY,
        label: 'Build Project'
    }
}

@injectable()
export class GlassFishExtensionCommandContribution implements CommandContribution, FrontendApplicationContribution {

    //Need to Save in Cookie Later + Periodic Refresh
    isServerStarted: boolean = false;

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(SelectionService) protected readonly selectionService: SelectionService,
        @inject(TerminalService) private readonly terminalService: TerminalService,
        @inject(MiniBrowserOpenHandler) protected readonly openHandler: MiniBrowserOpenHandler,
        @inject(FrontendApplicationStateService) private readonly stateService: FrontendApplicationStateService,
        @inject(CommandService) private readonly commandService: CommandService
    ) { }

    async onStart(app: FrontendApplication) {
        this.stateService.reachedState('ready').then(
            async (a) => {
                //Start Server
                await this.commandService.executeCommand(GlassFishCommands.START_SERVER.id);
                //Add JDBC
                await this.commandService.executeCommand(GlassFishCommands.BUILD_PROJECT.id);
                //Build Project
                // await this.commandService.executeCommand(GlassFishCommands.ADD_JDBC_RESOURCE.id);
                //Deploy Project
                // await this.commandService.executeCommand(GlassFishCommands.DEPL.id);

                // this.openHandler.openPreview("localhost:8080//SimpleBlog-war/");
            }
        )
    }

    registerCommands(registry: CommandRegistry): void {

        registry.registerCommand(GlassFishCommands.START_SERVER, {
            execute: async () => {
                this.messageService.info("Starting GlassFish Server");

                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText("asadmin start-domain --verbose && exit 1\n")

                this.isServerStarted = true;
                this.messageService.info("GlassFish Server Started Successfully");
            },
            isEnabled: () => !this.isServerStarted
        })

        registry.registerCommand(GlassFishCommands.STOP_SERVER, {
            execute: async () => {
                this.messageService.info("Stopping GlassFish Server");

                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText("asadmin stop-domain && exit 1\n")

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
                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText(`asadmin deploy --force ${uri.path} || \\bin\\true && exit 1\n`);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                //Open Browser to target URL
                this.openHandler.openPreview("localhost:8080//SimpleBlog-war/");
                this.messageService.info("Application Deployed Successfully");
            },
            isVisible: uri => {
                return uri.path.ext == '.war';
            }
        }))

        registry.registerCommand(GlassFishCommands.UNDEPLOY_WAR, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText(`asadmin undeploy ${uri.path} && exit 1\n`);
            },
            isVisible: uri => {
                //return !uri.path.ext && uri.path.toString().endsWith(".war");
                return uri.path.ext == '.war';
            }
        }))

        registry.registerCommand(GlassFishCommands.ADD_JDBC_RESOURCE, new UriAwareCommandHandler<URI>(this.selectionService, {
            execute: async uri => {
                // Deploy JDBC Resources
                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText(`asadmin add-resources ${uri.path} || \\bin\\true && exit 1\n`)
            },
            isVisible: uri => {
                return uri.path.ext == '.xml';
            }
        }))

        registry.registerCommand(GlassFishCommands.BUILD_PROJECT, {
            execute: async () => {
                // Deploy Build Project
                const terminalWidget = await this.terminalService.newTerminal({});
                await terminalWidget.start();
                await this.terminalService.activateTerminal(terminalWidget);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })

                await terminalWidget.sendText(`bash ./gradlew build\n`)
            },
            isEnabled: () => true
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

        menus.registerMenuAction(GlassFishMenu.GlassFish_BUILD, {
            commandId: GlassFishCommands.BUILD_PROJECT.id,
            label: 'Build Project',
            order: '2'
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

        menus.registerMenuAction(GlassFishMenu.GlassFish_NAVIGATOR_CONTEXT_MENU, {
            commandId: GlassFishCommands.ADD_JDBC_RESOURCE.id
        })

    }
}