/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fileSystem from 'fs';
import * as path from 'path';
import * as imageUtils from './image_utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flutter-image-asset-tool" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('flutter-image-asset-tool.generate', async (args: string) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from flutter-image-asset-tool!');
		const destinationPath = getDestinationPath(args);
		if (destinationPath) {
			const imagePath = await getImagePath();
			if (imagePath === undefined) {
				return;
			}
			var imageBasename = await renameImage(imagePath);

			for (let mode = 1; mode < 4; mode++) {
				scaleImageByScaleTimes(destinationPath, imageBasename, imagePath, 1.0 * mode);
			}
		}

	});

	context.subscriptions.push(disposable);
}

export function getDestinationPath(args: string) {
	if (args !== null) {
		const uri = vscode.Uri.parse(args);
		const path = uri.fsPath;
		const exists = fileSystem.existsSync(path);
		const isDirectoryAndExists = exists ? isDirectory(path) : false;

		if (isDirectoryAndExists) {
			return path;
		} else {
			vscode.window.showErrorMessage(`The '${path}' isn't a directory.`);
		}
	} else {
		vscode.window.showErrorMessage(`Can't run the command without a destination directory.`);
	}
}

export async function getImagePath() {
	const options = {
		canSelectMany: false,
		openLabel: 'Select Image',
		filters: { "Images": ['png', 'jpg', 'jpeg', 'JPG', 'JPEG'] }
	};

	const uri = await vscode.window.showOpenDialog(options);
	if (uri && uri[0]) {
		// console.log(uri[0].path);
		// return undefined;
		return uri[0].fsPath;
	}
}

export async function renameImage(imagePath: string) {
	var imageBasename = path.basename(imagePath);
	let ext = imageBasename.split('.').reverse()[0];
	var imageName = path.basename(imagePath, ext.length > 0 ? "." + ext : undefined);
	const options = {
		title: "rename for image(don not append extension name)",
		value: imageName,
		canSelectMany: false,
		openLabel: 'Select Image',
		filters: { "Images": ['png', 'jpg', 'jpeg', 'JPG', 'JPEG'] }
	};
	const newName = await vscode.window.showInputBox(options);
	if (newName !== undefined && newName.length !== 0) {
		imageBasename = newName + "." + ext;
	}
	return imageBasename;
}

export function scaleImageByScaleTimes(directoryPath: string, fileBasename: string, imagePath: string, scaleTimes: number) {
	let scale = (1.0 / 3) * scaleTimes;
	var destinationPath = path.join(directoryPath, fileBasename);
	if (scaleTimes === 1.0) {
		imageUtils.scaleImage(destinationPath, imagePath, scale);
		return;
	}

	destinationPath = path.join(directoryPath, `${Number(scaleTimes).toFixed(1)}x`);
	if (!fileSystem.existsSync(destinationPath)) {
		fileSystem.mkdirSync(destinationPath);
	}
	imageUtils.scaleImage(path.join(destinationPath, fileBasename), imagePath, scale);
};


export function isDirectory(path: string) {
	try {
		return fileSystem.lstatSync(path).isDirectory();
	} catch (e) {
		return false;
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
