import { formatUST, MICRO } from '@anchor-protocol/notation';
import { useWallet } from '@anchor-protocol/wallet-provider';
import { Badge, ClickAwayListener, IconButton } from '@material-ui/core';
import { NotificationsNone } from '@material-ui/icons';
import big from 'big.js';
import { useBank } from 'contexts/bank';
import { fixedGasUUSD } from 'env';
import { Children, ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';

export interface NotificationsProps {
  className?: string;
}

function NotificationsBase({ className }: NotificationsProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { status } = useWallet();
  const bank = useBank();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [open, setOpen] = useState(false);

  // ---------------------------------------------
  // compute
  // ---------------------------------------------
  const notifications = useMemo<ReactNode[]>(() => {
    if (status.status !== 'ready') {
      return [];
    }

    const notifications: ReactNode[] = [];

    if (big(bank.userBalances.uUSD).lt(fixedGasUUSD)) {
      notifications.push(
        <li>
          <p>Not enough uusd balance than fixed gas.</p>
          <p>
            your usd balance ={' '}
            {formatUST(big(bank.userBalances.uUSD).div(MICRO))} / fixed gas ={' '}
            {formatUST(big(fixedGasUUSD).div(MICRO))}
          </p>
        </li>,
      );
    }

    return notifications;
  }, [bank.userBalances.uUSD, status.status]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const onClickAway = () => {
    setOpen(false);
  };

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return status.status === 'ready' ? (
    <ClickAwayListener onClickAway={onClickAway}>
      <div
        className={className}
        data-notifications={
          notifications.length > 0 ? notifications.length : undefined
        }
      >
        <IconButton onClick={toggleOpen}>
          {notifications.length > 0 ? (
            <Badge badgeContent={notifications.length} color="primary">
              <NotificationsNone />
            </Badge>
          ) : (
            <NotificationsNone style={{ opacity: 0.1 }} />
          )}
        </IconButton>
        {open ? (
          <ul className="dropdown">
            {notifications.length > 0 ? (
              Children.toArray(notifications)
            ) : (
              <li>No Alram</li>
            )}
          </ul>
        ) : null}
      </div>
    </ClickAwayListener>
  ) : null;
}

export const Notifications = styled(NotificationsBase)`
  position: relative;
  display: inline;

  .dropdown {
    list-style: none;
    position: absolute;
    display: block;
    top: 28px;
    right: 0;
    padding: 0;
    z-index: 1000;
    border: 1px solid white;
    background-color: ${({ theme }) => theme.palette.background.paper};
    word-break: keep-all;
    white-space: nowrap;

    text-align: left;

    li {
      padding: 20px;

      &:not(:first-child) {
        border-top: 1px solid white;
      }
    }
  }
`;