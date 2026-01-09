import ExpandableBookingHistoryTable from './ExpandableBookingHistoryTable';
import ExpandableAgencyBookingRow from './ExpandableAgencyBookingRow';
import { fetchAdvertiserAgencies } from '../api';

const BookingHistoryByAgencyTable = ({ advertiserId, status }) => {
  return (
    <ExpandableBookingHistoryTable
      queryKey={['advertiser-agencies', advertiserId, status]}
      fetchFn={(params) => fetchAdvertiserAgencies(advertiserId, params)}
      status={status}
      entityName="Agency"
      getEntityId={(item) => item.agent_company_id}
      getEntityName={(item) => item.agent_company_name}
      ExpandableRowComponent={ExpandableAgencyBookingRow}
      expandableRowProps={{ advertiserId }}
    />
  );
};

export default BookingHistoryByAgencyTable;
