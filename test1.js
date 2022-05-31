const xlsx = require("xlsx");
const fs = require('fs/promises');
const pdfmake = require('pdfmake');
//reading the xls file
const workbook = xlsx.readFile("./fullrd.xls")
const fonts = {
    Roboto: {
        normal: 'fonts/Manrope-Regular.ttf',
        bold: 'fonts/Manrope-Bold.ttf',
        italics: 'fonts/Manrope-Italic.ttf',
        bolditalics: 'fonts/Manrope-MediumItalic.ttf',
    }
};
pdfmake.addFonts(fonts);
const installments = workbook.Sheets.RDInstallmentReport;
let start = 14;
const c_refno = "D"
const c_acno = "F"
const c_name = "G"
const c_deno = "H"
const c_inst = "M"
const c_amt = "K"
const c_reb = "N"
const c_df = "O"
const c_time = "W"
const c_suc = "V"
const c_fin_amt ="C"
class Per {
    constructor(refno, name, acno, deffee, time, reb, amt, deno, inst) {
        this.refno = refno;
        this.amt = amt;
        this.name = name;
        this.acno = acno;
        this.defult_fee = deffee;
        this.time = time;
        this.rebate = reb;
        this.deno = deno;
        this.inst = inst;
    }
}
const list_arrays = {
    ref_array : [], //contains all reference numbers
};
function in_ret(pre) {
    return installments[`${pre}${start}`]?.v;
}
while (in_ret(c_refno)?.startsWith('C')) {
    if (!list_arrays.ref_array.includes(in_ret(c_refno))) {
        list_arrays.ref_array.push(in_ret(c_refno)); //pushing reference number
        list_arrays[in_ret(c_refno)] = []; //creating an empty array for storing each person details for each ref no
    }
    //creating object and pushing into respective subarray
    let temp = new Per(
        in_ret(c_refno),
        in_ret(c_name),
        in_ret(c_acno),
        in_ret(c_df),
        in_ret(c_time),
        in_ret(c_reb),
        in_ret(c_amt),
        in_ret(c_deno),
        in_ret(c_inst)
    );
    list_arrays[in_ret(c_refno)].push(temp);
    start++;
}
const tot_recs = start - 1;
start++ //to skip total amount line

while (in_ret(c_fin_amt)?.startsWith('C')) {
    list_arrays[`amt-${in_ret(c_fin_amt)}`] = in_ret('J');
    start++
}

const docdef = {
    content : [
        {
            table : {
                body: [
                    ["reference no", "name", "account num", "amount", "created time"]
                ]
            }
        }
    ]
}

class TableTemp {
    constructor(arr, refno, totamt, time) {
        this.content = [
            `Agent Id : DOP.MIG0027447`,
            `List Reference No: ${refno}`,
            `Total Amount: ${totamt}`,
            `Created Time: ${time}`,
        ];
        this.content.push({
            table: {
                body: [
                    ["Account Name", "Account No.","Denomination", "Installments", "Rebate", "Default Fee", "Total Deposit amount" ]
                ]
            }
        }
        )
        this.content[this.content.length-1].table.body.push(...arr);
    }
}

let now = new Date();
const ref_array = list_arrays.ref_array;
async function create_lists() {
    //runs for each ref no
    for (let item in ref_array) {
        //runs for each name in ref no
        let temp = [];
        const refno = ref_array[item];
        list_arrays[refno].forEach((obj) => {
            temp.push([obj.name, obj.acno, obj.deno, obj.inst, obj.rebate, obj.defult_fee, obj.amt]);
        })
        console.log(list_arrays[`amt-${ref_array[item]}`], ref_array[item])
        let pdf = await pdfmake.createPdf(new TableTemp(temp, ref_array[item], list_arrays[`amt-${ref_array[item]}`], list_arrays[ref_array[item]][0].time));
        await fs.writeFile(`pdfs/${ref_array[item]}-${item}.pdf`, '');
        try {
            await pdf.write(`pdfs/${ref_array[item]}-${item}.pdf`);
        } catch (err) {
            console.log(err);
        }
    }
}

create_lists().then(()=>{
    console.log(`processed a total of ${tot_recs -14} names and ${ref_array.length} lists`);
    console.log(`took ${(Date.now() - now)/1000} secs`);
})
