import React from 'react';

import LoadingIndicator from '../loadingIndicator';
import BranchViewLink from '../branchViewLink';
import { SITE, GITHUB_BRANCHES } from '../../propTypes';

const branchRow = (branch, site) => (
  <tr key={branch.name}>
    <td>
      <p>{branch.name}</p>
    </td>
    <td>
      <BranchViewLink site={site} branchName={branch.name} />
    </td>
  </tr>
);

const renderTable = (site, branches) => (
  <table className="usa-table-borderless">
    <thead>
      <tr>
        <th>Branch</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {branches.data.map(branch => branchRow(branch, site))}
    </tbody>
  </table>
);

const renderLoadingState = () => <LoadingIndicator />;

const renderErrorState = () => (
  <p>
    An error occurred while downloading branch data from Github.
    Often this is because the repo is private or has been deleted.
  </p>
);

const SiteGithubBranchesTable = ({ site, branches }) => {
  if (branches.isLoading) {
    return renderLoadingState();
  } else if (branches.error || !branches.data || branches.data.length === 0) {
    return renderErrorState();
  }
  return renderTable(site, branches);
};


SiteGithubBranchesTable.propTypes = {
  site: SITE.isRequired,
  branches: GITHUB_BRANCHES.isRequired,
};

export default SiteGithubBranchesTable;
