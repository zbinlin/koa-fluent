import * as fs from "fs";
import * as path from "path";
import { FluentBundle } from "fluent";

export interface LocalizationNamespaces {
    [key: string]: LocalizationBundles;
}

export interface LocalizationBundles {
    [key: string]: FluentBundle;
}

export interface LocalizationItem {
    locale: string;
    namespace: string;
    messages: string;
}

const NS_DELIMITER = "/";

export function joinNamespace(ns: string, node: string): string {
    if (!ns) {
        return node;
    } else {
        return [ns, node].join(NS_DELIMITER);
    }
}

export function getNamespace(p: string, defaultNamespace: string = "default"): string {
    const lastIndex = p.lastIndexOf(NS_DELIMITER);
    if (lastIndex === -1) {
        return defaultNamespace;
    } else {
        return p.slice(0, lastIndex);
    }
}

export function parseLocalizationId(id: string, defaultNamespace: string = "default"): [string, string] {
    const ns = getNamespace(id, "");
    if (!ns) {
        return [defaultNamespace, id];
    } else {
        return [ns, id.slice(ns.length + 1)];
    }
}

export function getBundlesByNamespace(l10nNamespaces: LocalizationNamespaces, ns: string): LocalizationBundles {
    if (l10nNamespaces[ns]) {
        return l10nNamespaces[ns];
    }
    return l10nNamespaces[joinNamespace(ns, "default")];
}

export function getBundleFromBundlesByLanguages(bundles: LocalizationBundles, locales: string[]): FluentBundle | void {
    for (const locale of locales) {
        const bundle = bundles[locale];
        if (bundle) {
            return bundle;
        }
    }
}

export function* getLocalesFromDir(dir: string, parents?: string, locale?: string): IterableIterator<LocalizationItem> {
    const dirents = fs.readdirSync(dir, {
        withFileTypes: true,
    });

    for (const dirent of dirents) {
        if (dirent.isFile() && path.extname(dirent.name) === ".ftl") {
            const basename = path.basename(dirent.name, path.extname(dirent.name));
            const messages = fs.readFileSync(path.join(dir, dirent.name), {
                encoding: "utf-8",
            });
            if (locale) {
                yield {
                    namespace: joinNamespace(parents!, basename),
                    locale,
                    messages,
                };
            } else {
                yield {
                    namespace: joinNamespace(parents!, "default"),
                    locale: basename,
                    messages,
                };
            }
        } else if (dirent.isDirectory()) {
            const ns = locale ? joinNamespace(parents!, dirent.name) : parents;
            yield* getLocalesFromDir(path.join(dir, dirent.name), ns, locale || dirent.name);
        }
    }
}

