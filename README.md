# koa-fluent

Fluent middleware for koa


## Install

```shell
npm install koa-fluent
```


## Usage

```javascript
import * as Koa from "koa";
import fluent from "koa-fluent";

const app = new Koa();

/**
 *
 * Adds `ftl` function to app.context
 * dirs list tree
 * ./locales
 * ├── en-US.ftl
 * ├── jp.ftl
 * └── zh-CN.ftl
 */
fluent(app, {
    dirs: './locales', // locales dir
    defaultLanguage: 'en-US', // optional
    functionName: 'ftl', // optional
    queryField: 'ftl_locale', // optional
    cookieField: 'ftl_locale', // optional
});

/**
 * Use ctx.ftl to format message
 */
app.use(async (ctx, next) => {
    ctx.body = ctx.ftl('welcome', {
        name: 'colin,
    });
});
```
