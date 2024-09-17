'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/features/theme/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>('');
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? '' : value;
    });
  };

  useEffect(() => {
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]',
    );
    if (selector) {
      selector.classList.add('active');
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const setActiveRoute = () => {
    const allLinks = document.querySelectorAll('.sidebar ul a.active');
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove('active');
    }
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]',
    );
    selector?.classList.add('active');
  };

  return (
    <div className={semidark ? 'dark' : ''}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
      >
        <div className="h-full bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
              <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">
                RDD
              </span>
            </Link>

            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('dashboard')}
                >
                  <div className="flex items-center">
                    <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('dashboard')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('sales')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('analytics')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('finance')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('crypto')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <IconMinus className="hidden h-5 w-4 flex-none" />
                <span>{t('apps')}</span>
              </h2>

              <li className="nav-item">
                <ul>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuChat className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('chat')}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuMailbox className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('mailbox')}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuTodo className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('todo_list')}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuNotes className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('notes')}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuScrumboard className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('scrumboard')}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuContacts className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('contacts')}
                        </span>
                      </div>
                    </Link>
                  </li>

                  <li className="menu nav-item">
                    <button
                      type="button"
                      className={`${currentMenu === 'invoice' ? 'active' : ''} nav-link group w-full`}
                      onClick={() => toggleMenu('invoice')}
                    >
                      <div className="flex items-center">
                        <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('invoice')}
                        </span>
                      </div>

                      <div className={currentMenu !== 'invoice' ? '-rotate-90 rtl:rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>

                    <AnimateHeight duration={300} height={currentMenu === 'invoice' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <Link href="/">{t('list')}</Link>
                        </li>
                        <li>
                          <Link href="/">{t('preview')}</Link>
                        </li>
                        <li>
                          <Link href="/">{t('add')}</Link>
                        </li>
                        <li>
                          <Link href="/">{t('edit')}</Link>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>

                  <li className="nav-item">
                    <Link href="/" className="group">
                      <div className="flex items-center">
                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                          {t('calendar')}
                        </span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li>

              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <IconMinus className="hidden h-5 w-4 flex-none" />
                <span>{t('user_interface')}</span>
              </h2>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'component' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('component')}
                >
                  <div className="flex items-center">
                    <IconMenuComponents className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('components')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'component' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'component' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('tabs')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('accordions')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('modals')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('cards')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('carousel')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('countdown')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('counter')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('sweet_alerts')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('timeline')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('notifications')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('media_object')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('list_group')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('pricing_tables')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('lightbox')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'element' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('element')}
                >
                  <div className="flex items-center">
                    <IconMenuElements className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('elements')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'element' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'element' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('alerts')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('avatar')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('badges')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('breadcrumbs')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('buttons')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('button_groups')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('color_library')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('dropdown')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('infobox')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('jumbotron')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('loader')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('pagination')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('popovers')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('progress_bar')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('search')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('tooltips')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('treeview')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('typography')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <li className="menu nav-item">
                <Link href="/" className="group">
                  <div className="flex items-center">
                    <IconMenuCharts className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('charts')}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="menu nav-item">
                <Link href="/" className="group">
                  <div className="flex items-center">
                    <IconMenuWidgets className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('widgets')}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="menu nav-item">
                <Link href="/" className="group">
                  <div className="flex items-center">
                    <IconMenuFontIcons className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('font_icons')}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="menu nav-item">
                <Link href="/" className="group">
                  <div className="flex items-center">
                    <IconMenuDragAndDrop className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('drag_and_drop')}
                    </span>
                  </div>
                </Link>
              </li>

              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <IconMinus className="hidden h-5 w-4 flex-none" />
                <span>{t('tables_and_forms')}</span>
              </h2>

              <li className="menu nav-item">
                <Link href="/" className="group">
                  <div className="flex items-center">
                    <IconMenuTables className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('tables')}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'datalabel' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('datalabel')}
                >
                  <div className="flex items-center">
                    <IconMenuDatatables className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('datatables')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'datalabel' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'datalabel' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('basic')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('advanced')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('skin')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('order_sorting')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('multi_column')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('multiple_tables')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('alt_pagination')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('checkbox')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('range_search')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('export')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('column_chooser')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'forms' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('forms')}
                >
                  <div className="flex items-center">
                    <IconMenuForms className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('forms')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'forms' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'forms' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('basic')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('input_group')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('layouts')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('validation')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('input_mask')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('select2')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('touchspin')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('checkbox_and_radio')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('switches')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('wizards')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('file_upload')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('quill_editor')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('markdown_editor')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('date_and_range_picker')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('clipboard')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <IconMinus className="hidden h-5 w-4 flex-none" />
                <span>{t('user_and_pages')}</span>
              </h2>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('users')}
                >
                  <div className="flex items-center">
                    <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('users')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('profile')}</Link>
                    </li>
                    <li>
                      <Link href="/">{t('account_settings')}</Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'page' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('page')}
                >
                  <div className="flex items-center">
                    <IconMenuPages className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('pages')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'page' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'page' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/">{t('knowledge_base')}</Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('contact_us_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('contact_us_cover')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/">{t('faq')}</Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('coming_soon_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('coming_soon_cover')}
                      </Link>
                    </li>
                    <li className="menu nav-item">
                      <button
                        type="button"
                        className={`${
                          errorSubMenu ? 'open' : ''
                        } w-full before:h-[5px] before:w-[5px] before:rounded before:bg-gray-300 hover:bg-gray-100 dark:text-[#888ea8] dark:hover:bg-gray-900 ltr:before:mr-2 rtl:before:ml-2`}
                        onClick={() => setErrorSubMenu(!errorSubMenu)}
                      >
                        {t('error')}
                        <div
                          className={`${errorSubMenu ? '-rotate-90 rtl:rotate-90' : ''} ltr:ml-auto rtl:mr-auto`}
                        >
                          <IconCaretsDown fill={true} className="h-4 w-4" />
                        </div>
                      </button>
                      <AnimateHeight duration={300} height={errorSubMenu ? 'auto' : 0}>
                        <ul className="sub-menu text-gray-500">
                          <li>
                            <a href="/pages/error404" target="_blank">
                              {t('404')}
                            </a>
                          </li>
                          <li>
                            <a href="/pages/error500" target="_blank">
                              {t('500')}
                            </a>
                          </li>
                          <li>
                            <a href="/pages/error503" target="_blank">
                              {t('503')}
                            </a>
                          </li>
                        </ul>
                      </AnimateHeight>
                    </li>

                    <li>
                      <Link href="/" target="_blank">
                        {t('maintenence')}
                      </Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'auth' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('auth')}
                >
                  <div className="flex items-center">
                    <IconMenuAuthentication className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('authentication')}
                    </span>
                  </div>

                  <div className={currentMenu !== 'auth' ? '-rotate-90 rtl:rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'auth' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <Link href="/" target="_blank">
                        {t('login_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('register_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('unlock_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('recover_id_boxed')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('login_cover')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('register_cover')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('unlock_cover')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/" target="_blank">
                        {t('recover_id_cover')}
                      </Link>
                    </li>
                  </ul>
                </AnimateHeight>
              </li>

              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <IconMinus className="hidden h-5 w-4 flex-none" />
                <span>{t('supports')}</span>
              </h2>

              <li className="menu nav-item">
                <Link href="/" target="_blank" className="nav-link group">
                  <div className="flex items-center">
                    <IconMenuDocumentation className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t('documentation')}
                    </span>
                  </div>
                </Link>
              </li>
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
