import React, { useEffect, useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import {
  Switch,
  Route,
  Redirect,
  Link,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import useRequest from '@util/useRequest';

import { InventoriesAPI } from '@api';
import { Card, CardActions } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { TabbedCardHeader } from '@components/Card';
import CardCloseButton from '@components/CardCloseButton';
import ContentError from '@components/ContentError';
import ContentLoading from '@components/ContentLoading';
import RoutedTabs from '@components/RoutedTabs';
import JobList from '@components/JobList';
import InventoryHostDetail from '../InventoryHostDetail';
import InventoryHostEdit from '../InventoryHostEdit';

function InventoryHost({ i18n, setBreadcrumb, inventory }) {
  const location = useLocation();
  const match = useRouteMatch('/inventories/inventory/:id/hosts/:hostId');
  const hostListUrl = `/inventories/inventory/${inventory.id}/hosts`;

  const {
    result: { host },
    error: contentError,
    isLoading,
    request: fetchHost,
  } = useRequest(
    useCallback(async () => {
      const response = await InventoriesAPI.readHostDetail(
        inventory.id,
        match.params.hostId
      );
      return {
        host: response,
      };
    }, [inventory.id, match.params.hostId]),
    {
      host: null,
    }
  );

  useEffect(() => {
    fetchHost();
  }, [fetchHost, location.pathname]);

  useEffect(() => {
    if (inventory && host) {
      setBreadcrumb(inventory, host);
    }
  }, [inventory, host, setBreadcrumb]);

  const tabsArray = [
    {
      name: (
        <>
          <CaretLeftIcon />
          {i18n._(t`Back to Hosts`)}
        </>
      ),
      link: `${hostListUrl}`,
      id: 0,
    },
    {
      name: i18n._(t`Details`),
      link: `${match.url}/details`,
      id: 1,
    },
    {
      name: i18n._(t`Facts`),
      link: `${match.url}/facts`,
      id: 2,
    },
    {
      name: i18n._(t`Groups`),
      link: `${match.url}/groups`,
      id: 3,
    },
    {
      name: i18n._(t`Completed Jobs`),
      link: `${match.url}/completed_jobs`,
      id: 4,
    },
  ];

  if (contentError) {
    return (
      <Card>
        <ContentError error={contentError}>
          {contentError.response && contentError.response.status === 404 && (
            <span>
              {i18n._(`Host not found.`)}{' '}
              <Link to={hostListUrl}>
                {i18n._(`View all Inventory Hosts.`)}
              </Link>
            </span>
          )}
        </ContentError>
      </Card>
    );
  }

  return (
    <>
      {['edit'].some(name => location.pathname.includes(name)) ? null : (
        <TabbedCardHeader>
          <RoutedTabs tabsArray={tabsArray} />
          <CardActions>
            <CardCloseButton linkTo={hostListUrl} />
          </CardActions>
        </TabbedCardHeader>
      )}

      {isLoading && <ContentLoading />}

      {!isLoading && host && (
        <Switch>
          <Redirect
            from="/inventories/inventory/:id/hosts/:hostId"
            to="/inventories/inventory/:id/hosts/:hostId/details"
            exact
          />
          <Route
            key="details"
            path="/inventories/inventory/:id/hosts/:hostId/details"
          >
            <InventoryHostDetail host={host} />
          </Route>
          <Route
            key="edit"
            path="/inventories/inventory/:id/hosts/:hostId/edit"
          >
            <InventoryHostEdit host={host} inventory={inventory} />
          </Route>
          <Route
            key="completed-jobs"
            path="/inventories/inventory/:id/hosts/:hostId/completed_jobs"
          >
            <JobList defaultParams={{ job__hosts: host.id }} />
          </Route>
          <Route key="not-found" path="*">
            <ContentError isNotFound>
              <Link to={`${match.url}/details`}>
                {i18n._(`View Inventory Host Details`)}
              </Link>
            </ContentError>
          </Route>
        </Switch>
      )}
    </>
  );
}

export default withI18n()(InventoryHost);
