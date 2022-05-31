/*
script to parse account number, name and dates
form rd html document
written on : Nov 30 2021
*/

(function () {
	const from = 9;
	const to = 105;
	const an = false;
	const name = true;
	const dom = false;
	const to_be_paid = false;
	const file_name = 'default_fn.txt'
	const ac_nopre = 'HREF_CustomAgentRDAccountFG.ACCOUNT_NUMBER_ALL_ARRAY['
	const dom_pre = 'HREF_CustomAgentRDAccountFG.DEPOSIT_AMOUNT_ALL_ARRAY['
	const name_pre = 'HREF_CustomAgentRDAccountFG.ACCOUNT_NAME_ALL_ARRAY['
	const date_pre = 'HREF_CustomAgentRDAccountFG.NEXT_RD_INSTALLMENT_DATE_ALL_ARRAY['
	function id_ret(which, no) {
		if (which === 'dom') {
			return `${dom_pre}${no}]`;
		}
		if (which === 'an') {
			return `${ac_nopre}${no}]`;
		}
		if (which === 'name') {
			return `${name_pre}${no}]`;
		}
		if (which === 'date') {
			return `${date_pre}${no}]`;
		}
		return null;
	}
	let arr = []
	for (let i = from; i <= to; i++) {
		let ac_no = document.getElementById(id_ret('an', i)).innerText;
		let dom = document.getElementById(id_ret('dom', i)).innerText;
		let name_tex = document.getElementById(id_ret('name', i)).innerText;
		let date_tex = document.getElementById(id_ret('date', i)).innerText;
		if (an) {
			arr.push(ac_no);
			arr.push('\t');
		}
		if (dom) {
			arr.push(dom);
			arr.push('\t');
		}
		if (name) {
			arr.push(name_tex);
			arr.push('\t\t\t\t');
		}
		if (to_be_paid) {
			arr.push(date_tex);
			//arr.push('\t');
		}
		arr.push('\n');
	}

	let blb = new Blob(arr,{ type:"text/plain; charset=utf-8" })
	let blobUrl = URL.createObjectURL(blb);
	let link = document.createElement("a"); // Or maybe get it from the current document
	link.href = blobUrl;
	link.download = file_name;
	link.innerHTML = "Click here to download the file";
	document.body.appendChild(link); // Or append it whereever you want
	return 'look at the document end for download link🔥'
})()
