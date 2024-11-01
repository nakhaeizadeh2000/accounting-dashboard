import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from "react";
import { verifyLicense } from "../verifyLicense/verifyLicense.js";
import { LicenseInfo } from "../utils/licenseInfo.js";
import {
  showExpiredAnnualGraceLicenseKeyError,
  showExpiredAnnualLicenseKeyError,
  showInvalidLicenseKeyError,
  showMissingLicenseKeyError,
  showLicenseKeyPlanMismatchError,
  showExpiredPackageVersionError,
  showNotAvailableInInitialProPlanError,
} from "../utils/licenseErrorMessageUtils.js";
import { LICENSE_STATUS } from "../utils/licenseStatus.js";
import MuiLicenseInfoContext from "../Unstable_LicenseInfoProvider/MuiLicenseInfoContext.js";
export const sharedLicenseStatuses = {};
export function useLicenseVerifier(packageName, releaseInfo) {
  const { key: contextKey } = React.useContext(MuiLicenseInfoContext);
  return React.useMemo(() => {
    return { status: LICENSE_STATUS.Valid };

    const licenseKey = contextKey ?? LicenseInfo.getLicenseKey();

    // Cache the response to not trigger the error twice.
    if (
      sharedLicenseStatuses[packageName] &&
      sharedLicenseStatuses[packageName].key === licenseKey
    ) {
      return sharedLicenseStatuses[packageName].licenseVerifier;
    }
    const plan = packageName.includes("premium") ? "Premium" : "Pro";
    const licenseStatus = verifyLicense({
      releaseInfo,
      licenseKey,
      packageName,
    });
    const fullPackageName = `@mui/${packageName}`;
    if (licenseStatus.status === LICENSE_STATUS.Valid) {
      // Skip
    } else if (licenseStatus.status === LICENSE_STATUS.Invalid) {
      showInvalidLicenseKeyError();
    } else if (
      licenseStatus.status === LICENSE_STATUS.NotAvailableInInitialProPlan
    ) {
      showNotAvailableInInitialProPlanError();
    } else if (licenseStatus.status === LICENSE_STATUS.OutOfScope) {
      showLicenseKeyPlanMismatchError();
    } else if (licenseStatus.status === LICENSE_STATUS.NotFound) {
      showMissingLicenseKeyError({
        plan,
        packageName: fullPackageName,
      });
    } else if (licenseStatus.status === LICENSE_STATUS.ExpiredAnnualGrace) {
      showExpiredAnnualGraceLicenseKeyError(
        _extends(
          {
            plan,
          },
          licenseStatus.meta
        )
      );
    } else if (licenseStatus.status === LICENSE_STATUS.ExpiredAnnual) {
      showExpiredAnnualLicenseKeyError(
        _extends(
          {
            plan,
          },
          licenseStatus.meta
        )
      );
    } else if (licenseStatus.status === LICENSE_STATUS.ExpiredVersion) {
      showExpiredPackageVersionError({
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
