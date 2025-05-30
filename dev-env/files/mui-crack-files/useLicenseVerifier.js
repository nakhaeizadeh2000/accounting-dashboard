"use strict";

var _interopRequireWildcard =
  require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.sharedLicenseStatuses = void 0;
exports.useLicenseVerifier = useLicenseVerifier;
var _extends2 = _interopRequireDefault(
  require("@babel/runtime/helpers/extends")
);
var React = _interopRequireWildcard(require("react"));
var _verifyLicense = require("../verifyLicense/verifyLicense");
var _licenseInfo = require("../utils/licenseInfo");
var _licenseErrorMessageUtils = require("../utils/licenseErrorMessageUtils");
var _licenseStatus = require("../utils/licenseStatus");
var _MuiLicenseInfoContext = _interopRequireDefault(
  require("../Unstable_LicenseInfoProvider/MuiLicenseInfoContext")
);
const sharedLicenseStatuses = (exports.sharedLicenseStatuses = {});
function useLicenseVerifier(packageName, releaseInfo) {
  const { key: contextKey } = React.useContext(_MuiLicenseInfoContext.default);
  return React.useMemo(() => {
    return { status: _licenseStatus.LICENSE_STATUS.Valid };

    const licenseKey = contextKey ?? _licenseInfo.LicenseInfo.getLicenseKey();

    // Cache the response to not trigger the error twice.
    if (
      sharedLicenseStatuses[packageName] &&
      sharedLicenseStatuses[packageName].key === licenseKey
    ) {
      return sharedLicenseStatuses[packageName].licenseVerifier;
    }
    const plan = packageName.includes("premium") ? "Premium" : "Pro";
    const licenseStatus = (0, _verifyLicense.verifyLicense)({
      releaseInfo,
      licenseKey,
      packageName,
    });
    const fullPackageName = `@mui/${packageName}`;
    if (licenseStatus.status === _licenseStatus.LICENSE_STATUS.Valid) {
      // Skip
    } else if (licenseStatus.status === _licenseStatus.LICENSE_STATUS.Invalid) {
      (0, _licenseErrorMessageUtils.showInvalidLicenseKeyError)();
    } else if (
      licenseStatus.status ===
      _licenseStatus.LICENSE_STATUS.NotAvailableInInitialProPlan
    ) {
      (0, _licenseErrorMessageUtils.showNotAvailableInInitialProPlanError)();
    } else if (
      licenseStatus.status === _licenseStatus.LICENSE_STATUS.OutOfScope
    ) {
      (0, _licenseErrorMessageUtils.showLicenseKeyPlanMismatchError)();
    } else if (
      licenseStatus.status === _licenseStatus.LICENSE_STATUS.NotFound
    ) {
      (0, _licenseErrorMessageUtils.showMissingLicenseKeyError)({
        plan,
        packageName: fullPackageName,
      });
    } else if (
      licenseStatus.status === _licenseStatus.LICENSE_STATUS.ExpiredAnnualGrace
    ) {
      (0, _licenseErrorMessageUtils.showExpiredAnnualGraceLicenseKeyError)(
        (0, _extends2.default)(
          {
            plan,
          },
          licenseStatus.meta
        )
      );
    } else if (
      licenseStatus.status === _licenseStatus.LICENSE_STATUS.ExpiredAnnual
    ) {
      (0, _licenseErrorMessageUtils.showExpiredAnnualLicenseKeyError)(
        (0, _extends2.default)(
          {
            plan,
          },
          licenseStatus.meta
        )
      );
    } else if (
      licenseStatus.status === _licenseStatus.LICENSE_STATUS.ExpiredVersion
    ) {
      (0, _licenseErrorMessageUtils.showExpiredPackageVersionError)({
        packageName: fullPackageName,
      });
    } else if (process.env.NODE_ENV !== "production") {
      throw new Error("missing status handler");
    }
    sharedLicenseStatuses[packageName] = {
      key: licenseKey,
      licenseVerifier: licenseStatus,
    };
    return licenseStatus;
  }, [packageName, releaseInfo, contextKey]);
}
