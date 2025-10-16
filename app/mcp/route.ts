import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");

  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: html,
    description: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
  };
  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  // DOOM Widget
  const doomHtml = await getAppsSdkCompatibleHtml(baseURL, "/widget/doom");
  const doomWidget: ContentWidget = {
    id: "play_doom",
    title: "Play DOOM",
    templateUri: "ui://widget/doom-template.html",
    invoking: "Loading DOOM...",
    invoked: "DOOM loaded! Have fun!",
    html: doomHtml,
    description: "Launch DOOM game in a widget using FreeDoom",
    widgetDomain: baseURL,
  };

  server.registerResource(
    "doom-widget",
    doomWidget.templateUri,
    {
      title: doomWidget.title,
      description: doomWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": doomWidget.description,
        "openai/widgetPrefersBorder": false,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${doomWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": doomWidget.description,
            "openai/widgetPrefersBorder": false,
            "openai/widgetDomain": doomWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    doomWidget.id,
    {
      title: doomWidget.title,
      description: "Launch DOOM game in a widget. Play the classic FPS game using FreeDoom.",
      inputSchema: {},
      _meta: widgetMeta(doomWidget),
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "DOOM widget loaded! Use WASD or arrow keys to move, Ctrl to shoot, Space to open doors. Have fun!",
          },
        ],
        structuredContent: {
          game: "DOOM",
          engine: "FreeDoom",
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(doomWidget),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
