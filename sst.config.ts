/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "fl0wo",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {

    // static website looking ./
    const url = 'floriansabani.com'

    const website = new sst.aws.StaticSite("W", {
      domain: {
        name: `${url}`,
        redirects: [`www.${url}`]
      }
    });

  },
});
