'use client';

import { NavMenu } from '../../nav-menu/NavMenu';
import { useAuth } from '../../../context/user-context';
import classes from './HeaderMenu.module.scss';
import Link from 'next/link';

type HeaderMenuProps = {
  onClose: () => void;
};

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  onClose,
}: HeaderMenuProps) => {
  const { currentUser } = useAuth();

  return (
    <div className={classes.headerMenu}>
      <div className={classes.close} onClick={onClose}>
        <i className="fas fa-times"></i>
      </div>
      <div className={classes.logo}>
        <h2>
          <Link href="/" onClick={onClose}>
            Daily Quiz
          </Link>
        </h2>
      </div>
      {currentUser && (
        <div onClick={onClose}>
          <NavMenu usageClass="headerNav"></NavMenu>
        </div>
      )}
    </div>
  );
};
