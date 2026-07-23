// ==UserScript==
// @name         Stripmunk Exporter
// @name:nl      Stripmunk Exporteren
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Allows to export all entries in one single collection to CSV in excel format.
// @description:nl Exporteer alle strips in een collectie naar een CSV bestand dat in excel gelezen kan worden.
// @author       dbPieter
// @match        https://app.stripmunk.be/series/11749
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stripmunk.be
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function installButton(attempt = 0) {
        const optionsContainer = document.querySelector('#optionsMenu ul li ul li');
        // Wait for the optionsContainer to render
        if (!optionsContainer) {
            if (attempt >= 10) {
                console.error('Stripmunk Exporter: optionsContainer not found after 10 attempts, giving up.');
                return;
            }
            setTimeout(() => installButton(attempt + 1), 75);
            return;
        }
        console.info('Installing Stripmunk export button')
        const addButton = document.createElement('a');
        addButton.textContent = 'Exporteren';
        addButton.addEventListener('click', () => {
            const comic = document.getElementById('menuTitel')?.innerText.trim();
            const lines = scrape(comic);
            downloadAsFile(lines, comic);
        });

        const listItem = document.createElement('li');
        listItem.append(addButton)
        optionsContainer.parentElement.append(listItem);
    }

    function scrape(comic) {
        //All selectors. Normally, only one ID is allowed to be displayed on a page, but the app doesn't seem to
        //honor that
        const selectors = {
            /**
             * A single entry containing the serial number, title and whether it's in the users collection
             */
            entries: '#comicGridCell',
            /**
             * If present in an entry, the user has this
             */
            inCollection: '#collectionCircleFull',
            /**
             * Serial number. Not the ISBN.
             */
            serialNumber: '#comicGridCellTitle',
            title: '#comicGridCellSubTitle',
        };

        const lines = ['comic;number;title;inCollection']
        for (const entry of document.querySelectorAll(selectors.entries)) {
            const serialNumber = entry.querySelector(selectors.serialNumber)?.innerText.trim().replace(/^#/, '')
            const title = entry.querySelector(selectors.title)?.innerText.trim();
            const inCollection = !!entry.querySelector(selectors.inCollection);
            lines.push([comic, serialNumber, title, inCollection].join(';'))
        }
        return lines;
    }

    function downloadAsFile(lines, comic) {
        const csvContent = lines.join('\r\n');
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${comic ?? 'stripmunk'}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }


    installButton();
})();