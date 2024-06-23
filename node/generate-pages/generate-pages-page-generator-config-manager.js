import {PageGeneratorManagerBase} from "./generate-pages-page-generator.js";

class _PageGeneratorManagebrew extends PageGeneratorManagerBase {
	_page = "managebrew.html";

	_pageTitle = "Manage Homebrew";
	_navbarDescription = "View, Add, and Delete Homebrew.";

	_scripts = [
		"managebrew.js",
	];
}

class _PageGeneratorManageprerelease extends PageGeneratorManagerBase {
	_page = "manageprerelease.html";

	_pageTitle = "Manage Prerelease Content";
	_navbarDescription = "View, Add, and Delete Prerelease Content.";

	_scripts = [
		"manageprerelease.js",
	];
}

export const PAGE_GENERATORS_MANAGER = [
	new _PageGeneratorManagebrew(),
	new _PageGeneratorManageprerelease(),
];
