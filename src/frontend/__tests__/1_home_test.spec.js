import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow, mount, render } from 'enzyme';
import Home from '.././Home';
import AuthModal from '../modals/AuthModal';
import CreateModal from '../modals/CreateModal';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('<Home/>', () => {
  beforeEach(() => {
      window.sessionStorage = {}
  })
  it('will render component', () => {
    const wrapper = render(<Home />);
    expect(wrapper).toMatchSnapshot();
  })
  it('will render join game button', () => {
    const wrapper = render(<Home />)
    expect(wrapper.find('#join-button')).toBeDefined();
  });
  it('will render create game button', () => {
    const wrapper = render(<Home/>)
    expect(wrapper.find('#create-button')).toBeDefined();

  });
  it('will render modal if user clicks button and is not logged in', () => {
    const wrapper = mount(<Home/>);
    wrapper.find('#join-button').simulate('click');
    expect(wrapper.find(AuthModal).props().open).toBeDefined();
  })
  it('will take you to join game route if logged in and click join button', () => {
    window.sessionStorage = {name: 'test'}
    const wrapper = render(<Home/>)
    expect(true).toBeFalsy();
  });
  it('will open create game modal if logged in and click create game button', () => {
    window.sessionStorage = {name: 'test'}
    const wrapper = mount(<Home/>);
    expect(wrapper.find(CreateModal).props().open).toBeDefined();
  })
})
