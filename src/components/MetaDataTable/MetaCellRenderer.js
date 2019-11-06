import { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

class MetaCellRenderer extends Component {
  render() {
    const { value, data } = this.props;

    if (
      (data.key === 'easyip_last_contact_attempt' ||
        data.key === 'easyip_first_successful_contact' ||
        data.key === 'easyip_last_successful_contact' ||
        data.key === 'easyip_created' ||
        data.key === 'easyip_updated') &&
      data.key !== value
    ) {
      if (value) {
        return moment(value)
          .utc()
          .format('MMM. DD, YYYY, hh:mm A');
      }
      return '';
    }

    return value;
  }
}

MetaCellRenderer.defaultProps = {
  value: ''
};

MetaCellRenderer.propTypes = {
  value: PropTypes.any,
  data: PropTypes.object.isRequired
};

export default MetaCellRenderer;
