var infiniteScroll = {
    containingTable: document.querySelector("table"),
    tableBodyNode: document.querySelector("tbody"),
    topEmptyDiv: null, //set in init
    topEmptyDivHeight: 0,
    bottomEmptyDiv: null, //set in init
    bottomEmptyDivHeight: (paintData.length - 100) * 44.44,
    currentlyRenderedRows: [],
    lastMatchedData: null, //set in init
    lastScroll: 0,
    searchField: document.getElementById("searchField"),
    numColumns: ["MonthlyDemand", "ForecastedMonthlyDemand", "DaysOnHand", "QuantityOnHand", 
        "ReorderPointAsDays", "BackorderQuantity", "BatchSize", "MetalQuantity", 
        "MetalStagedQuantity", "Line", "PaintDensity", "PaintDensityMax", "PaintMinutesOfWork",
        "PaintLinearFeetOfWork"],
    textColumns: ["Sku", "ItemName", "PaintSku", "MetalSku"],
    createRowHtml: function(rowData) {
        var rowHtml = `
            <td>${rowData.Sku}</td>
            <td>${rowData.ItemName}</td>
            <td>${rowData.PaintSku}</td>
            <td>${rowData.MetalSku}</td>
            <td>${rowData.MonthlyDemand}</td>
            <td>${rowData.ForecastedMonthlyDemand}</td>
            <td>${rowData.DaysOnHand}</td>
            <td>${rowData.QuantityOnHand}</td>
            <td>${rowData.ReorderPointAsDays}</td>
            <td>${rowData.BackorderQuantity}</td>
            <td>${rowData.OldestBackorderDate}</td>
            <td>${rowData.BatchSize}</td>
            <td>${rowData.MetalQuantity}</td>
            <td>${rowData.MetalStagedQuantity}</td>
            <td>${rowData.Line === null ? 'N/A' : rowData.Line}</td>
            <td>${rowData.PaintDensity === null ? 0 : rowData.PaintDensity}</td>
            <td>${rowData.PaintDensityMax === null ? 0 : rowData.PaintDensityMax}</td>
            <td>${rowData.PaintMinutesOfWork}</td>
            <td>${rowData.PaintLinearFeetOfWork}</td>
            <td>0</td>
            <td>dummy</td>
            <td>dummy</td>
            <td>dummy</td>
            <td>0</td>
            <td>0</td>
            <td><img src="plusImg.png" alt="plus sign"></td>
        `
        return rowHtml;
    },
    init: function() {
        var newRow,
            position = 0,
            containerDiv = document.querySelector(".outside");

        infiniteScroll.lastMatchedData = paintData;

        containerDiv.style.cssText = `margin-right: ${-(infiniteScroll.containingTable.offsetWidth - infiniteScroll.containingTable.clientWidth)}px;`;
        infiniteScroll.topEmptyDiv = document.createElement("div");
        infiniteScroll.topEmptyDiv.className = "emptyDiv";
        infiniteScroll.tableBodyNode.appendChild(infiniteScroll.topEmptyDiv);

        infiniteScroll.currentlyRenderedRows.push(position);
        for (var i = 0; i < 100; i++) {
            newRow = document.createElement("tr");
            newRow.innerHTML = infiniteScroll.createRowHtml(paintData[i]);
            infiniteScroll.tableBodyNode.appendChild(newRow);
            position += 50;
            infiniteScroll.currentlyRenderedRows.push(position);
        }
        infiniteScroll.bottomEmptyDiv = document.createElement("div");
        infiniteScroll.bottomEmptyDiv.style.cssText = `height: ${infiniteScroll.bottomEmptyDivHeight}px;`;
        infiniteScroll.bottomEmptyDiv.className = "emptyDiv";
        infiniteScroll.tableBodyNode.appendChild(infiniteScroll.bottomEmptyDiv);

        infiniteScroll.containingTable.addEventListener("scroll", infiniteScroll.onScroll);
        infiniteScroll.searchField.addEventListener("keyup", infiniteScroll.searchPaintDataAndRenderMatchingRows)
    },
    onScroll: function() {
        var currentScroll = infiniteScroll.containingTable.scrollTop,
            topDisplayedRenderPosition = infiniteScroll.roundDownToNearest50(currentScroll),
            swapRow;

        if (currentScroll > infiniteScroll.lastScroll) {
            for (var i = topDisplayedRenderPosition; i < topDisplayedRenderPosition + 1000; i += 50) {
                if (infiniteScroll.currentlyRenderedRows.indexOf(i + 2000) === -1) {
                    swapRow = infiniteScroll.tableBodyNode.firstElementChild.nextElementSibling;
                    infiniteScroll.tableBodyNode.insertBefore(swapRow, infiniteScroll.bottomEmptyDiv);
                    swapRow.innerHTML = infiniteScroll.createRowHtml(infiniteScroll.lastMatchedData[i / 50]);
                    infiniteScroll.topEmptyDivHeight += 50;
                    infiniteScroll.topEmptyDiv.style.cssText = `height: ${infiniteScroll.topEmptyDivHeight}px;`;
                    infiniteScroll.bottomEmptyDivHeight -= 50;
                    infiniteScroll.bottomEmptyDiv.style.cssText = `height: ${infiniteScroll.bottomEmptyDivHeight}px;`;
                    infiniteScroll.currentlyRenderedRows.shift();
                    infiniteScroll.currentlyRenderedRows.push(i + 2000);
                }
            }
        } else {
            for (var i = topDisplayedRenderPosition; i < topDisplayedRenderPosition + 1000; i += 50) {
                if (infiniteScroll.currentlyRenderedRows.indexOf(i) === -1) {
                    swapRow = infiniteScroll.tableBodyNode.lastElementChild.previousElementSibling;
                    infiniteScroll.tableBodyNode.insertBefore(swapRow, infiniteScroll.topEmptyDiv.nextElementSibling);
                    swapRow.innerHTML = infiniteScroll.createRowHtml(infiniteScroll.lastMatchedData[i / 50]);
                    infiniteScroll.topEmptyDivHeight -= 50;
                    infiniteScroll.topEmptyDiv.style.cssText = `height: ${infiniteScroll.topEmptyDivHeight}px;`;
                    infiniteScroll.bottomEmptyDivHeight += 50;
                    infiniteScroll.bottomEmptyDiv.style.cssText = `height: ${infiniteScroll.bottomEmptyDivHeight}px;`;
                    infiniteScroll.currentlyRenderedRows.pop();
                    infiniteScroll.currentlyRenderedRows.unshift(i);
                }
            }
        }
        
        infiniteScroll.lastScroll = currentScroll;
    },
    roundDownToNearest50: function (x) {
        return Math.floor(x/50) * 50;
    },
    searchPaintDataAndRenderMatchingRows() {
        var currentMatchedData = [],
            searchText = infiniteScroll.searchField.value;

        if (isNaN(parseInt(searchText))) {
            for (var i = 0; i < paintData.length; i++) {
                for (var k = 0; k < infiniteScroll.textColumns.length; k++) {
                    if (paintData[i][infiniteScroll.textColumns[k]].toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
                        currentMatchedData.push(paintData[i]);
                        break;
                    }
                }
            }
        } else {
            var matchCondition;
            for (var i = 0; i < paintData.length; i++) {
                for (var k = 0; k < infiniteScroll.numColumns.length; k++) {
                    matchCondition = paintData[i][infiniteScroll.numColumns[k]] ? paintData[i][infiniteScroll.numColumns[k]].toString().indexOf(searchText) !== -1 : false;
                    if (matchCondition) {
                        currentMatchedData.push(paintData[i]);
                        break;
                    }
                }
            }
        }
        infiniteScroll.renderMatchedRows(currentMatchedData);
        infiniteScroll.lastMatchedData = currentMatchedData;
    },
    renderMatchedRows: function (matchedData) {
        var row, position = 0, renderedRows = [];

        infiniteScroll.topEmptyDivHeight = 0;
        infiniteScroll.topEmptyDiv.style.cssText = `height: ${infiniteScroll.topEmptyDivHeight}px;`;
        infiniteScroll.containingTable.scrollTop = 0;

        renderedRows.push(position);
        if (matchedData.length > 100) {
            for (var i = 0; i < 100; i++) {
                row = infiniteScroll.tableBodyNode.childNodes[i+2];
                row.innerHTML = infiniteScroll.createRowHtml(matchedData[i]);
                row.style.cssText = "";
                position += 50;
                renderedRows.push(position);
            }
            infiniteScroll.bottomEmptyDivHeight = (matchedData.length - 100) * 44.44
            infiniteScroll.bottomEmptyDiv.style.cssText = `height: ${infiniteScroll.bottomEmptyDivHeight}px;`;
        } else {
            for (var i = 0; i < 100; i++) {
                row = infiniteScroll.tableBodyNode.childNodes[i+2];
                if (i < matchedData.length) {
                    row.innerHTML = infiniteScroll.createRowHtml(matchedData[i]);
                    position += 50;
                    renderedRows.push(position);
                } else {
                    row.style.cssText = "display: none;";
                }          
            }
            infiniteScroll.bottomEmptyDivHeight = 0
            infiniteScroll.bottomEmptyDiv.style.cssText = `height: ${infiniteScroll.bottomEmptyDivHeight}px;`;
        }

        infiniteScroll.currentlyRenderedRows = renderedRows;
    }
};

infiniteScroll.init();