/** Code shown in the Pro section of the Summand demo. */
export const SUMMAND_READ_SNIPPET = `import { readInvoice } from "@weber-development/summand-read"

const invoice = readInvoice(bytes) // UBL, CII or ZUGFeRD PDF

invoice.seller.vatId              // "DE 123456789"     BT-31
invoice.buyerReference            // "04011000-12349-88" BT-10
invoice.totals.payable            // "233.00"           BT-115
invoice.payment.creditTransfers   // [{ accountId: "DE79…", bic: "DRESDEFFXXX" }]
invoice.lines.map((l) => [l.item.name, l.quantity, l.unit, l.netAmount])`
