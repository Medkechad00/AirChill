import type { RequestRow } from './types';
const sample = (id:string, name:string, area:string, type:string, units:string, issue:string, status:RequestRow['status'], time:string, property='Villa'): RequestRow => ({
  session_id:id, customer_name:name, location:area, property_type:property, service_type:type,
  issue_description:issue, unit_count:units, ac_type:'Split AC', preferred_window:'Tomorrow afternoon',
  photo_note:'Photo to be reviewed by staff', summary:`${name} | ${type} | ${issue} | ${units} unit(s) | ${area}`,
  status, updated_at:time
});
export const mockRequests: RequestRow[] = [
  sample('demo-acc-001','Ahmed Al Mansouri','Dubai Marina','AC Repair','3','One AC unit not cooling','Pending staff review','2026-11-13T12:41:00Z'),
  sample('demo-acc-002','Samira Hassan','Jumeirah','AC Maintenance','2','Annual maintenance request','In progress','2026-11-13T11:23:00Z','Apartment'),
  sample('demo-acc-003','Youssef Karim','Al Barsha','AC Repair','4','Weak cooling in living room','Pending staff review','2026-11-13T10:05:00Z'),
  sample('demo-acc-004','Mariam Ali','Business Bay','Duct Cleaning','5','Duct cleaning inquiry','Completed','2026-11-12T15:21:00Z','Office'),
  sample('demo-acc-005','Omar Khan','JLT','AC Maintenance','1','Unit making unusual sound','Completed','2026-11-12T10:07:00Z','Apartment'),
  sample('demo-acc-006','Noura Faris','Palm Jumeirah','AC Repair','3','Water leak near indoor unit','In progress','2026-11-11T16:54:00Z'),
];
