/// <reference path="./.sst/platform/config.d.ts" />

import {domainUrl, projectName} from "./consts";

export default $config({
  app(input) {
    return {
      name: `${projectName}`,
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.StaticSite("W", {
      domain: {
        name: `${domainUrl}`,
        redirects: [`www.${domainUrl}`]
      }
    });
  },
});
