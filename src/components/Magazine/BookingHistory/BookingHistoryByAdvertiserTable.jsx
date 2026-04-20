import ExpandableBookingHistoryTable from './ExpandableBookingHistoryTable';
import ExpandableAdvertiserBookingRow from './ExpandableAdvertiserBookingRow';
import { fetchCompanyAdvertisers } from '../api';

const BookingHistoryByAdvertiserTable = ({ companyId, status }) => {
  return (
    <ExpandableBookingHistoryTable
      queryKey={['company-advertisers', companyId, status]}
      fetchFn={(params) => fetchCompanyAdvertisers(companyId, params)}
      status={status}
      entityName="Advertiser"
      getEntityId={(item) => item.advertiser_id}
      getEntityName={(item) => item.advertiser_company}
      ExpandableRowComponent={ExpandableAdvertiserBookingRow}
      expandableRowProps={{ companyId }}
    />
  );
};

export default BookingHistoryByAdvertiserTable;
