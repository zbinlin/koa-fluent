import { FluentBundle, FluentBundleContructorOptions } from "fluent";
import { LanguageNegotiationOptions } from "fluent-langneg";
import Koa, { ParameterizedContext } from "koa";
import * as util from "util";
import {
    parseLocalizationId,
    LocalizationNamespaces,
    getLocalesFromDir,
    getBundlesByNamespace,
    getBundleFromBundlesByLanguages,
} from "./lib";

const debuglog = util.debuglog("koa-fluent");

declare module "koa" {
    interface BaseContext {
        __language?: string;
        __languages?: string[];
        ftl: (id: string, args?: {}, error?: string[]) => string;
        __getLanguage: () => string | void;
        __getLanguages: () => string[];
    }
}

export interface ILocalizationOptions extends LanguageNegotiationOptions, FluentBundleContructorOptions {
    readonly dirs: string | ReadonlyMap<string, string>;
    readonly defaultLanguage?: string;
    readonly functionName?: string;
    readonly queryField?: string;
    readonly cookieField?: string;
}

const DefaultOptions: Partial<ILocalizationOptions> = {
    functionName: "ftl",
    defaultLanguage: "en-US",
    queryField: "ftl_locale",
    cookieField: "ftl_locale",
};

function createLocalization<S, CT>(target: Koa<S, CT>, options: ILocalizationOptions): void {
    options = Object.assign({}, DefaultOptions, options);

    type Context = ParameterizedContext<S, CT>;

    const {
        cookieField,
        defaultLanguage = options.defaultLocale,
        functionName,
        functions,
        queryField,
        transform,
        useIsolating,
    } = options;

    const l10nNamespaces: LocalizationNamespaces = {};

    const dirs = (typeof (options.dirs as string)) === "string"
        ? new Map([[undefined, options.dirs as string]])
        : options.dirs as ReadonlyMap<string, string>;

    for (const [ns, dir] of dirs) {
        for (const item of getLocalesFromDir(dir, ns)) {
            let l10nBundles = l10nNamespaces[item.namespace];
            if (!l10nBundles) {
                l10nBundles = l10nNamespaces[item.namespace] = {};
            }
            const bundle = l10nBundles[item.locale] = new FluentBundle(
                item.locale,
                {
                    functions,
                    transform,
                    useIsolating,
                },
            );
            bundle.addMessages(item.messages);
        }
    }

    const { context } = target;

    context.__getLanguage = function __getLanguage(this: Context): string | void {
        if (this.__language) {
            return this.__language;
        }

        const cookieLocale = this.cookies.get(cookieField!);
        if (cookieLocale) {
            this.__language = cookieLocale;
            return cookieLocale;
        }

        const queryLocale = this.query[queryField!];
        if (queryLocale) {
            this.__language = queryLocale;
            return queryLocale;
        }

        const languages = this.acceptsLanguages();
        if ((languages as string[]).length > 0) {
            this.__language = (languages as string[])[0];
            return (languages as string[])[0];
        }
        return;
    };

    context.__getLanguages = function __getLanguages(this: Context): string[] {
        if (this.__languages) {
            return this.__languages;
        }
        // TODO
        return [];
    };

    context[functionName as "ftl"] = function ftl(this: Context, id: string, args?: {}, errors?: Array<string | Error>): string {
        const [ns, token] = parseLocalizationId(id);
        const bundles = getBundlesByNamespace(l10nNamespaces, ns);

        if (!bundles) {
            debuglog(`Not found id(${token}) in ${ns}`);
            if (Array.isArray(errors)) {
                errors.push(new Error(`Not found id(${token}) in ${ns}`));
            }
            return "";
        }

        const language = this.__getLanguage();

        let bundle = getBundleFromBundlesByLanguages(bundles, [language as string]);

        if (!bundle) {
            debuglog(`Does not supports language(${language})`);

            bundle = bundles[defaultLanguage!];
            if (!bundle) {
                debuglog(`Cannot found default locale(${defaultLanguage})`);
                if (Array.isArray(errors)) {
                    errors.push(new Error(`Does not supports language(${language}`));
                    errors.push(new Error(`Cannot found default locale(${defaultLanguage})`));
                }
                return "";
            }
        }

        const message = bundle.getMessage(token);

        if (message == null) {
            debuglog(`Not found ${token} in bundle(language: ${bundle.locales[0]}, path:${ns})`);
            if (Array.isArray(errors)) {
                errors.push(new Error(`Not found ${token} in bundle(language: ${bundle.locales[0]}, path:${ns})`));
            }
            return "";
        }

        return bundle.format(message, args, errors);
    };
}

export default createLocalization;
