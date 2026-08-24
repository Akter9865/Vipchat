import ExcelJS from 'exceljs';
import { Response } from 'express';

export async function exportContactsToCsv(contacts: any[], res: Response) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="vipchat_contacts_${Date.now()}.csv"`);

  const headers = [
    'Contact ID',
    'Full Name',
    'Mobile Number',
    'Email Address',
    'Lead Status',
    'Lead Score',
    'Assigned Agent',
    'Tags',
    'Source',
    'Conversation Count',
    'Created At',
    'Last Active At',
  ];

  let csvContent = headers.join(',') + '\n';

  contacts.forEach((c) => {
    const tagsStr = (c.tags || []).map((t: any) => t.name).join('; ');
    const row = [
      `"${c.id}"`,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${c.mobileNumber || ''}"`,
      `"${c.emailAddress || ''}"`,
      `"${c.leadStatus || ''}"`,
      c.leadScore || 0,
      `"${c.assignedAgent?.fullName || 'Unassigned'}"`,
      `"${tagsStr.replace(/"/g, '""')}"`,
      `"${c.source || ''}"`,
      c.conversationCount || 0,
      `"${new Date(c.createdAt).toISOString()}"`,
      `"${new Date(c.lastActiveAt).toISOString()}"`,
    ];
    csvContent += row.join(',') + '\n';
  });

  res.send(csvContent);
}

export async function exportContactsToXlsx(contacts: any[], res: Response) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Contacts');

  worksheet.columns = [
    { header: 'Contact ID', key: 'id', width: 24 },
    { header: 'Full Name', key: 'fullName', width: 22 },
    { header: 'Mobile Number', key: 'mobileNumber', width: 18 },
    { header: 'Email Address', key: 'emailAddress', width: 25 },
    { header: 'Lead Status', key: 'leadStatus', width: 16 },
    { header: 'Lead Score', key: 'leadScore', width: 12 },
    { header: 'Assigned Agent', key: 'agent', width: 22 },
    { header: 'Tags', key: 'tags', width: 25 },
    { header: 'Source', key: 'source', width: 18 },
    { header: 'Conversations', key: 'convos', width: 14 },
    { header: 'Created Date', key: 'createdAt', width: 20 },
    { header: 'Last Active', key: 'lastActiveAt', width: 20 },
  ];

  // Header styling
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFB88D33' }, // Luxury gold header
  };

  contacts.forEach((c) => {
    worksheet.addRow({
      id: c.id,
      fullName: c.fullName,
      mobileNumber: c.mobileNumber,
      emailAddress: c.emailAddress || 'N/A',
      leadStatus: c.leadStatus,
      leadScore: c.leadScore,
      agent: c.assignedAgent?.fullName || 'Unassigned',
      tags: (c.tags || []).map((t: any) => t.name).join(', '),
      source: c.source,
      convos: c.conversationCount || 0,
      createdAt: new Date(c.createdAt).toLocaleDateString(),
      lastActiveAt: new Date(c.lastActiveAt).toLocaleDateString(),
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="vipchat_contacts_${Date.now()}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
}
