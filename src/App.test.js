import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

jest.mock('./services/api', () => ({}));

describe('App', () => {
  const Component = shallow(<App />, { context: { dispatch: jest.fn() } });

  it('renders without crashing', () => {});
});
