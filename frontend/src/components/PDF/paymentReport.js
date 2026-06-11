import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import _ from 'lodash';

pdfMake.fonts = {
  Sarabun: {
    normal: 'Sarabun-Light.ttf',
    bold: 'Sarabun-Regular.ttf',
    italics: 'Sarabun-LightItalic.ttf',
    bolditalics: 'Sarabun-Italic.ttf',
  },
};

dayjs.locale('th');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

const formatMoney = (val) =>
  (val || 0)?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,');

const getNetAmount = (row) => {
  const raw =
    row?.net_price != null
      ? row.net_price
      : (row?.price || 0) - (row?.withholding_tax || 0);
  return Number.isFinite(raw) ? raw : 0;
};

const genBody = (rows = []) => {
  return _.map(rows, (row, index) => [
    {
      text: index + 1,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.budget?.prefix || ''}${row?.budget?.budget_number || ''}`,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: row?.project?.project_number || '',
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.name || ''}`,
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${formatMoney(getNetAmount(row))}`,
      alignment: 'right',
      fontSize: 8,
      border: [false, false, false, false],
    },
  ]);
};

const paymentReport = async (payment, info) => {
  const rows = payment?.expenses_list || [];
  const genItemBody = genBody(rows);

  const sumItems = _.sumBy(rows, getNetAmount);
  const totalAmount = sumItems ? Number(sumItems) : 0;

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [20, 90, 20, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 10,
    },
    info: {
      title: 'Payment Report',
      author: info?.name || '',
      subject: 'Payment Report',
    },
    header: [
      {
        margin: [20, 15, 20, 0],
        stack: [
          {
            text: 'รายงานการจ่ายเงิน (Payment)',
            style: 'headerTitle',
            alignment: 'center',
          },
          {
            text: `${info?.name || ''}`,
            style: 'headerCompany',
            alignment: 'center',
            margin: [0, 4, 0, 0],
          },
          {
            columns: [
              {
                width: '*',
                stack: [
                  {
                    text: `เลขที่เอกสาร: ${payment?.payment_number || '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `วันที่ทำรายการ: ${payment?.createdAt ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm') : '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `วันที่ขอรับ: ${payment?.dateRequest ? dayjs(payment.dateRequest).format('DD/MM/YYYY') : '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `วันที่จ่าย: ${payment?.datePayment ? dayjs(payment.datePayment).format('DD/MM/YYYY') : '-'}`,
                    style: 'headerMeta',
                  },
                ],
              },
              {
                width: '*',
                stack: [
                  {
                    text: `ผู้รับเงิน: ${payment?.payee?.name || '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `ธนาคาร: ${payment?.payee?.bank || '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `เลขบัญชี: ${payment?.payee?.account_number || '-'}`,
                    style: 'headerMeta',
                  },
                  {
                    text: `สถานะ: ${payment?.status || 'PENDING'}`,
                    style: 'headerMeta',
                  },
                ],
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            columns: [
              {
                text: `จำนวนรายการ: ${rows?.length || 0} รายการ`,
                style: 'headerMeta',
                width: 'auto',
              },
              {
                text: `ยอดรวม: ${formatMoney(totalAmount)} บาท`,
                style: 'headerTotal',
                width: '*',
                alignment: 'right',
              },
            ],
            margin: [0, 8, 0, 0],
          },
        ],
      },
    ],
    content: [
      {
        table: {
          headerRows: 1,
          widths: ['6%', '18%', '14%', '*', '18%'],
          body: [
            [
              {
                text: 'ลำดับ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'งบประมาณ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'โครงการ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'รายการ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ยอดจ่าย',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
            ],
            ...genItemBody,
            [
              {
                text: 'รวมเงินทั้งหมด',
                fillColor: '#d2d4d2',
                alignment: 'center',
                colSpan: 4,
                border: [false, false, false, true],
              },
              {},
              {},
              {},
              {
                text: formatMoney(totalAmount),
                alignment: 'right',
                border: [false, false, false, true],
                bold: true,
              },
            ],
          ],
        },
      },
    ],
    footer: function (currentPage, pageCount) {
      return {
        margin: [20, 0],
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              {
                text: `พิมพ์เมื่อ: ${dayjs().format('DD/MM/YYYY HH:mm')} น.`,
                fontSize: 8,
                alignment: 'left',
                border: [false, false, false, false],
              },
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                alignment: 'right',
                fontSize: 8,
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
      };
    },
    styles: {
      headerTitle: {
        fontSize: 16,
        bold: true,
        color: '#1a1a1a',
      },
      headerCompany: {
        fontSize: 12,
        bold: true,
        color: '#333333',
      },
      headerMeta: {
        fontSize: 10,
        color: '#1a1a1a',
      },
      headerTotal: {
        fontSize: 16,
        bold: true,
        color: '#d32f2f',
      },
    },
  };

  pdfMake.createPdf(documentRef).open();
};

export default paymentReport;

