import * as path from "path";
import { FluentBundle } from "fluent";
import {
    joinNamespace,
    getNamespace,
    parseLocalizationId,
    getLocalesFromDir,
    LocalizationNamespaces,
    LocalizationBundles,
    getBundlesByNamespace,
    getBundleFromBundlesByLanguages,
} from "../lib";

const FIXTURES_DIR = path.join(__dirname, "./fixtures");

describe("joinNamespace()", (): void => {
    it("returns source if namespace is empty", (): void => {
        expect(joinNamespace("", "foo")).toBe("foo");
    });

    it("returns with namespace", (): void => {
        expect(joinNamespace("root", "foo")).toBe("root/foo");

        expect(joinNamespace("first/second", "three")).toBe("first/second/three");

        expect(joinNamespace("root", "foo.bar")).toBe("root/foo.bar");
    });
});

describe("getNamespace()", (): void => {
    it("returns default namespace when namespace does not exists", (): void => {
        expect(getNamespace("foo")).toBe("default");

        expect(getNamespace("foo", "bar")).toBe("bar");
    });

    it("returns namespace", (): void => {
        expect(getNamespace("foo/bar")).toBe("foo");

        expect(getNamespace("first/second/three")).toBe("first/second");

        expect(getNamespace("root/foo.bar")).toBe("root");
    });
});

describe("parseLocalizationId()", (): void => {
    it("returns default namespace and id when namespace does not exists", (): void => {
        expect(parseLocalizationId("foo")).toEqual(["default", "foo"]);

        expect(parseLocalizationId("foo", "bar")).toEqual(["bar", "foo"]);
    });

    it("returns namespace and id", (): void => {
        expect(parseLocalizationId("foo/bar")).toEqual(["foo", "bar"]);

        expect(parseLocalizationId("first/second/three")).toEqual(["first/second", "three"]);

        expect(parseLocalizationId("root/foo.bar")).toEqual(["root", "foo.bar"]);
    });
});

describe("getBundlesByNamespace()", (): void => {
    it("returns fluent bundles", (): void => {
        const fooBundles = {};
        const rootFoobarBundles = {};
        const firstSecondThreeBundles = {};
        const l10ns: LocalizationNamespaces = {
            default: fooBundles,
            root: rootFoobarBundles,
            "first/second": firstSecondThreeBundles,
        };

        expect(getBundlesByNamespace(l10ns, "")).toBe(fooBundles);
        expect(getBundlesByNamespace(l10ns, "root")).toBe(rootFoobarBundles);
        expect(getBundlesByNamespace(l10ns, "first/second")).toBe(firstSecondThreeBundles);
    });
});

describe("getBundleFromBundlesByLanguages()", (): void => {
    it("returns fluent bundle", (): void => {
        const enBundle = new FluentBundle("en-US");
        const zhBundle = new FluentBundle("zh-CN");
        const bundles: LocalizationBundles = {
            "en-US": enBundle,
            "zh-CN": zhBundle,
        };

        expect(getBundleFromBundlesByLanguages(bundles, ["en-US"])).toBe(enBundle);
        expect(getBundleFromBundlesByLanguages(bundles, ["zh-CN"])).toBe(zhBundle);
    });

    it("returns undefined when language does not exists", (): void => {
        expect(getBundleFromBundlesByLanguages({}, ["zh-CN"])).toBeUndefined();
    });
});

describe("getLocalesFromDir()", (): void => {
    function getL10ns(dirs: string | Map<string, string>): LocalizationNamespaces {
        const l10ns: LocalizationNamespaces = {};
        const aDirs = (typeof (dirs as string)) === "string" ? new Map([[undefined, dirs as string]]) : dirs as Map<string, string>;
        for (const [ns, dir] of aDirs) {
            for (const item of getLocalesFromDir(dir, ns)) {
                let bundles = l10ns[item.namespace];
                if (!bundles) {
                    bundles = l10ns[item.namespace] = {};
                }
                const bundle = bundles[item.locale] = new FluentBundle(item.locale);
                bundle.addMessages(item.messages);
            }
        }
        return l10ns;
    }
    it("returns localization items from single dir", (): void => {
        const aPath = path.join(FIXTURES_DIR, "./single");
        const l10ns = getL10ns(aPath);
        expect(l10ns).toHaveProperty("default");
        expect(l10ns).toHaveProperty("other");

        const defaultBundles = l10ns.default;
        expect(defaultBundles).toHaveProperty("en-US");
        expect(defaultBundles).toHaveProperty("zh-CN");

        const enBundle = defaultBundles["en-US"];
        const zhBundle = defaultBundles["zh-CN"];
        expect(enBundle.getMessage("hello")).toBe("Hello, World!");
        expect(zhBundle.getMessage("hello")).toBe("欢迎！");

        const otherBundles = l10ns.other;
        expect(otherBundles).toHaveProperty("en-US");
        expect(otherBundles).toHaveProperty("zh-CN");

        const otherEnBundle = otherBundles["en-US"];
        const otherZhBundle = otherBundles["zh-CN"];
        expect(otherEnBundle.getMessage("language")).toBe("English");
        expect(otherZhBundle.getMessage("language")).toBe("中文");
    });

    it("returns localization items from multi dirs", (): void => {
        const aPaths = new Map([
            [ "bar", path.join(FIXTURES_DIR, "./multi/bar") ],
            [ "foo", path.join(FIXTURES_DIR, "./multi/foo") ],
        ]);
        const l10ns = getL10ns(aPaths);

        expect(l10ns).toHaveProperty("foo/default");
        expect(l10ns).toHaveProperty("bar/default");
        expect(l10ns).toHaveProperty("foo/other");
        expect(l10ns).toHaveProperty("bar/other");

        const fooDefaultBundles = l10ns["foo/default"];
        expect(fooDefaultBundles).toHaveProperty("jp");
        expect(fooDefaultBundles).not.toHaveProperty("en-US");
        expect(fooDefaultBundles).not.toHaveProperty("zh-CN");

        const fooJpDefaultBundle = fooDefaultBundles["jp"];
        expect(fooJpDefaultBundle.getMessage("test")).toBe("テスト");

        const fooOtherBundles = l10ns["foo/other"];
        expect(fooOtherBundles).toHaveProperty("en-US");
        expect(fooOtherBundles).toHaveProperty("zh-CN");
        expect(fooOtherBundles).not.toHaveProperty("jp");

        const fooEnOtherBundle = fooOtherBundles["en-US"];
        const fooZhOtherBundle = fooOtherBundles["zh-CN"];
        expect(fooEnOtherBundle.getMessage("test")).toBe("Test");
        expect(fooZhOtherBundle.getMessage("test")).toBe("测试");

        const barDefaultBundles = l10ns["bar/default"];
        expect(barDefaultBundles).toHaveProperty("zh-CN");
        expect(barDefaultBundles).toHaveProperty("en-US");

        const barEnDefaultBundle = barDefaultBundles["en-US"];
        const barZhDefaultBundle = barDefaultBundles["zh-CN"];
        expect(barEnDefaultBundle.getMessage("hello-world")).toBe("Hello World!");
        expect(barZhDefaultBundle.getMessage("hello-world")).toBe("欢迎世界！");

        const barOtherBundles = l10ns["bar/other"];
        expect(barOtherBundles).toHaveProperty("en-US");
        expect(barOtherBundles).not.toHaveProperty("zh-CN");

        const barEnOtherBundle = barOtherBundles["en-US"];
        expect(barEnOtherBundle.getMessage("other")).toBe("Other");
    });

    it("returns localization items from single dir and only default namespace", (): void => {
        const aPath = path.join(FIXTURES_DIR, "./foobar");
        const l10ns = getL10ns(aPath);
        expect(l10ns).toHaveProperty("default");

        const defaultBundles = l10ns.default;
        expect(defaultBundles).toHaveProperty("en-US");
        expect(defaultBundles).toHaveProperty("zh-CN");
        expect(defaultBundles).toHaveProperty("jp");

        const enBundle = defaultBundles["en-US"];
        const zhBundle = defaultBundles["zh-CN"];
        const jpBundle = defaultBundles["jp"];

        expect(enBundle.getMessage("welcome")).toBe("Welcome");
        expect(zhBundle.getMessage("welcome")).toBe("欢迎");
        expect(jpBundle.getMessage("welcome")).toBe("ようこそ");
    });
});
