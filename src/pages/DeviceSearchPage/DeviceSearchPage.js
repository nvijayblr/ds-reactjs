import React, { Fragment } from 'react';
import DeviceSearchInput from '../../components/DeviceSearchInput/DeviceSearchInput';
import DeviceSearchResults from '../../components/DeviceSearchResults/DeviceSearchResults';

function DeviceSearchPage() {
  const hiddenColumns = ['status'];
  return (
    <Fragment>
      <DeviceSearchInput />
      <DeviceSearchResults hiddenColumns={hiddenColumns} />
    </Fragment>
  );
}

export default DeviceSearchPage;
