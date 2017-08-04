import React from 'react';
import PropTypes from 'prop-types';

import { SITE } from '../propTypes';

const isDefaultBranch = (branchName, site) => branchName === site.defaultBranch;

const isDemoBranch = (branchName, site) => branchName === site.demoBranch;

// we only want to link branch names that are alphanumeric plus _ and -
const isLinkable = s => /^[a-zA-Z0-9_-]+$/.test(s);

const getUrlAndViewText = (branchName, site) => {
  if (isDefaultBranch(branchName, site)) {
    return { url: site.viewLink, viewText: 'View site' };
  } else if (isDemoBranch(branchName, site)) {
    return { url: site.demoViewLink, viewText: 'View demo' };
  }
  return {
    url: `/preview/${site.owner}/${site.repository}/${branchName}/`,
    viewText: 'Preview branch',
  };
};

const BranchViewLink = ({ branchName, site }) => {
  if (!isLinkable(branchName)) {
    return <p>Branch name has un-linkable characters</p>;
  }

  const { url, viewText } = getUrlAndViewText(branchName, site);

  return (<a href={url} target="_blank" rel="noopener noreferrer">{ viewText }</a>);
};

BranchViewLink.propTypes = {
  branchName: PropTypes.string.isRequired,
  site: SITE.isRequired,
};


export default BranchViewLink;
