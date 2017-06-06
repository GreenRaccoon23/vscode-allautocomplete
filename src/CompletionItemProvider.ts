/**
 * COPYRIGHT 2017 Atishay Jain<contact@atishay.me>
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as vscode from 'vscode';
import { Settings } from './Settings';
import { WordList } from './WordList';

/**
 * Class that provides completion items for this extension.
 *
 * @class CompletionItemProviderClass
 */
class CompletionItemProviderClass {
    /**
     * Provides the completion items for the supplied words.
     *
     * @param {TextDocument} document
     * @param {Position} position
     * @param {CancellationToken} token
     * @returns
     */
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const line = document.lineAt(position.line).text;
        let i = 0;
        for (i = position.character - 1; i > 0; --i) {
            if ((line[i] || "").match(Settings.whitespaceSplitter)) {
                break;
            }
        }
        const pos = new vscode.Position(position.line, i);
        let word = document.getText(new vscode.Range(pos, position));
        word = word.replace(Settings.whitespaceSplitter, '');
        let results = [];
        WordList.forEach((trie, doc) => {
            if (!Settings.showCurrentDocument) {
                if (doc === document) {
                    return;
                }
            }
            let words = trie.find(word);
            if (words) {
                results = results.concat(words);
            }
        });
        const clean = [], map = {};
        // Do not show the same word in autocomplete.
        map[word] = {};
        map[WordList.activeWord] = {};
        // Deduplicate results now.
        results.forEach((item) => {
            if (!map[item.label]) {
                clean.push(item);
                map[item.label] = item;
            }
        });
        return clean;
    }
}

export const CompletionItemProvider = new CompletionItemProviderClass()
