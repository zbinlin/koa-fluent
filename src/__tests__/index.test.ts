import fluent from "../index";
import Koa from "koa";
import * as path from "path";

describe("fluent middleware", (): void => {
    let app: Koa<{}, {}>;
    beforeEach((): void => {
        app = new Koa<{}, {}>();
    });
    it("adds __getLanguage to context", (): void => {
        fluent(app, {
            dirs: path.join(__dirname, "./fixtures/single"),
        });

        expect(app.context).toHaveProperty("__getLanguage");
    });
    it("adds __getLanguages to context", (): void => {
        fluent(app, {
            dirs: path.join(__dirname, "./fixtures/single"),
        });

        expect(app.context).toHaveProperty("__getLanguages");
    });
    it("adds default fluent function name(ftl) to context", (): void => {
        fluent(app, {
            dirs: path.join(__dirname, "./fixtures/single"),
        });

        expect(app.context).toHaveProperty("ftl");
    });
    it("adds custom fluent function name to context", (): void => {
        fluent(app, {
            dirs: path.join(__dirname, "./fixtures/single"),
            functionName: "__",
        });

        expect(app.context).toHaveProperty("__");
        expect(app.context).not.toHaveProperty("ftl");
    });

    // TODO
});
