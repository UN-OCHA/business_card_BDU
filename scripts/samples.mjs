// Test cards. Placeholder people; real-world lengths (long UN titles, Geneva address).
export const SAMPLES = [
  { id: 'en', lang: 'en', data: {
    firstName: 'Francisco Javier', lastName: 'Cueto Avellaneda', title: 'Public Information Officer',
    units: 'Brand and Design Unit\nCommunications Branch\nFinance and Outreach Division',
    office: '+1 967 666 99 61', mobile: '+1 666 999 01 75', email: 'email@un.org',
    address: 'Palais des Nations, 8-14 Avenue de la Paix\n1211 Geneva, Switzerland' } },
  { id: 'en-long', lang: 'en', data: {
    firstName: 'Maria Fernanda Alejandra', lastName: 'de la Cruz Villanueva-Santamaría',
    title: 'Senior Humanitarian Affairs Officer and Head of the Access, Civil-Military Coordination and Protection Section',
    units: 'Coordination Response Division\nEmergency Response Support Branch\nHumanitarian Access Unit',
    office: '+41 22 917 12 34', mobile: '+41 79 123 45 67', email: 'maria.delacruz-villanueva@un.org',
    address: 'Palais des Nations, 8-14 Avenue de la Paix\n1211 Geneva 10, Switzerland' } },
  { id: 'en-toolong', lang: 'en', formats: ['avery-8371'], data: {
    firstName: 'Maria Fernanda Alejandra', lastName: 'de la Cruz Villanueva-Santamaría',
    title: 'Senior Humanitarian Affairs Officer and Head of the Access, Civil-Military Coordination and Protection Section, Office of the Director',
    units: 'Coordination Response Division\nEmergency Response Support Branch\nHumanitarian Access Unit\nField Operations Team',
    office: '+41 22 917 12 34', mobile: '+41 79 123 45 67', email: 'maria.fernanda.delacruz-villanueva@un.org',
    address: 'Palais des Nations, 8-14 Avenue de la Paix\n1211 Geneva 10, Switzerland\nSocial: @ocha_maria' } },
  { id: 'fr', lang: 'fr', data: {
    firstName: 'Élodie', lastName: 'Lefèvre-Nguyễn', title: 'Chargée des affaires humanitaires',
    units: 'Section de la communication\nBureau de pays – Haïti',
    office: '+509 2 812 30 00', mobile: '+509 3 456 78 90', email: 'lefevre@un.org',
    address: 'Delmas 19, Rue Faustin 1er\nPort-au-Prince, Haïti' } },
  { id: 'ru', lang: 'ru', data: {
    firstName: 'Анастасия', lastName: 'Воронцова-Дашкова', title: 'Сотрудник по гуманитарным вопросам',
    units: 'Отдел координации\nОтделение в Женеве',
    office: '+41 22 917 12 34', mobile: '+41 79 123 45 67', email: 'vorontsova@un.org',
    address: 'Дворец Наций, 1211 Женева 10\nШвейцария' } },
  { id: 'zh', lang: 'zh', data: {
    firstName: '王', lastName: '晓明', title: '人道主义事务干事',
    units: '协调应急司\n紧急反应支助处',
    office: '+1 212 963 1234', mobile: '+1 917 367 5555', email: 'wang.xiaoming@un.org',
    address: '联合国总部，纽约 NY 10017\n美国' } },
  { id: 'ar', lang: 'ar', data: {
    firstName: 'فاطمة', lastName: 'الزهراء بن علي', title: 'موظفة الشؤون الإنسانية',
    units: 'قسم التنسيق\nالمكتب القطري – الأردن',
    office: '+962 6 551 2345', mobile: '+962 79 123 4567', email: 'benali@un.org',
    address: 'عمّان، الأردن\nص.ب. 1234' } },
];
