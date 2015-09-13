/// <reference path="node/node.d.ts" />
/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
/// <reference path="mocha/mocha.d.ts" />
/// <reference path="chai/chai.d.ts" />
/// <reference path="./rx.testing.d.ts" />

declare module "rx/index" {
	import index = require("rx");
	export = index;
}