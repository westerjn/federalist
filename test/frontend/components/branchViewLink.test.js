import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import BranchViewLink from '../../../frontend/components/branchViewLink';
import appConfig from '../../../config/app';

describe('<BranchViewLink/>', () => {
  const testSite = {
    defaultBranch: 'default-branch',
    demoBranch: 'demo-branch',
    viewLink: 'https://prod-url.com',
    demoViewLink: 'https://demo-url.com',
    owner: 'test-owner',
    repository: 'test-repo',
  };

  it('does not link an unlinkable branch name', () => {
    const wrapper = shallow(<BranchViewLink branchName="abc-#-def" site={testSite} />);
    expect(wrapper.find('span').length).to.equal(1);
    expect(wrapper.find('span').text()).to.equal('Branch name has un-linkable characters');
  });

  it('renders a link to the default branch\'s site', () => {
    const wrapper = shallow(<BranchViewLink branchName="default-branch" site={testSite} />);
    const anchor = wrapper.find('a');
    expect(anchor.length).to.equal(1);
    expect(anchor.prop('href')).to.equal('https://prod-url.com');
    expect(anchor.text()).equal('View site');
  });

  it('renders a link to the demo branch\'s site', () => {
    const wrapper = shallow(<BranchViewLink branchName="demo-branch" site={testSite} />);
    const anchor = wrapper.find('a');
    expect(anchor.length).to.equal(1);
    expect(anchor.prop('href')).to.equal('https://demo-url.com');
    expect(anchor.text()).equal('View demo');
  });

  it('renders a preview link to the other branches', () => {
    const wrapper = shallow(<BranchViewLink branchName="some-other-branch" site={testSite} />);
    const anchor = wrapper.find('a');
    expect(anchor.length).to.equal(1);
    expect(anchor.prop('href')).to.equal(`${appConfig.preview_hostname}/preview/test-owner/test-repo/some-other-branch/`);
    expect(anchor.text()).equal('Preview branch');
  });
});
