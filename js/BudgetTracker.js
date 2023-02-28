/* CLASS THAT HANDLES EVERYTHING RELATED TO THE BUDGET TRACKER*/
export default class BudgetTracker{

    /* */
    constructor(querySelectorString){
        this.root = document.querySelector(querySelectorString);
        this.root.innerHTML = BudgetTracker.html();

        this.root.querySelector(".new-entry").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });

        // Load initial data from local storage
        this.load();
    }

    /* RETURN HTML FOR THE ACTUAL TABLE ITSELF*/
    static html(){
        return `
            <table class="budget-tracker">

                <!--table head-->
                <thead> 
                    <tr> <!--table row-->
                        <th>Date</th> <!--table header-->
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                </thead>

                <!--table body 1-->
                <tbody class="entries"></tbody>

                <!--table body 2-->
                <tbody>
                    <tr>
                        <td colspan="5" class="controls">
                            <button type="button" class="new-entry">New Entry</button>
                        </td>
                    </tr>
                </tbody>

                <!--table footer-->
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <strong>Total:</strong>
                            <span class="total">$0.00</span>
                        </td>
                    </tr>
                </tfoot>

            </table>
        `;
    }

    /* RETURN HTML STRING FOR A SINGLE ROW INSIDE THAT TABLE*/
    static entryHtml(){
        return `
            <tr>   
                <td> <!--table data-->
                    <input type="date" class="input input-date">
                </td>
                <td>
                    <input type="text" class="input input-description" placeholder="e.g bills, groceries, ect...">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount">
                </td>
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td>
            </tr>
        `;
    }

    /* INITIAL LOADING OF THE DATA */
    load(){
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries") || "[]");

        for (const entry of entries ){
            this.addEntry(entry);
        }

        this.updateSummary();
    }

    /* TAKE ALL CURRENT ROWS OF TABLE AND WORK OUT TOTAL AMOUNT AND DISPLAY IN BTTOM RIGHT CONRER*/
    updateSummary(){
        const total = this.getEntryRows().reduce((total, row) => {
            const amount = row.querySelector(".input-amount").value;
            const isExpense = row.querySelector(".input-type").value === "expense";
            const modifier = isExpense ? -1 : 1;

            return total + (amount * modifier);
        }, 0);

        const totalFormatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }

    /* TAKE ALL DATA AND SAVE IT TO LOCAL STORAGE */
    save(){
        const data = this.getEntryRows().map(row => {
            return {
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value),
            };
        });

        localStorage.setItem("budget-tracker-entries", JSON.stringify(data));
        this.updateSummary();
    }

    /* TAKE IN ENTRY AS AN OBJECT AND ADDS A NEW ENTRY INSIDE THE TABLE */
    addEntry(entry = {}) {
        this.root.querySelector(".entries").insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

        const row = this.root.querySelector(".entries tr:last-of-type");

        row.querySelector(".input-date").value = entry.date || new Date().toISOString().replace(/T.*/,  "");
        row.querySelector(".input-description").value = entry.description || "";
        row.querySelector(".input-type").value = entry.type || "income";
        row.querySelector(".input-amount").value = entry.amount || 0;
        row.querySelector(".delete-entry").addEventListener("click", e => {
            this.onDeleteEntryBtnClick(e);
        });

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change", () => this.save());
        });


    }

    /* HELPS US RETURN ALL ACTIVE ROWS */
    getEntryRows(){
        return Array.from(this.root.querySelectorAll(".entries tr"));
    }

    /* ADDS NEW ENTRY */
    onNewEntryBtnClick(){
        this.addEntry();
    }

    /* DELETES ENTRY */
    onDeleteEntryBtnClick(e){
        e.target.closest("tr").remove();
        this.save();
    }

}