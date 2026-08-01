# Vestcodes Org Cleanup Plan

Goal: keep the ERPNext fork and the Zivvy monorepo as the two active Zivvy
repositories. Do not delete repositories without a final explicit confirmation
and a backup/export checkpoint.

## Intended Keep List

- `Vestcodes/erpnext` — ERPNext fork.
- `Vestcodes/zivvy` — target Zivvy monorepo after the monorepo branch is merged.

## Zivvy Repos To Retire After Monorepo Cutover

- `Vestcodes/zivvy-api`
- `Vestcodes/zivvy-backend`
- `Vestcodes/zivvy-sec`
- `Vestcodes/zivvy-wa-legacy`

Recommended path:

1. Push monorepo to `Vestcodes/zivvy`.
2. Confirm production deploys from the monorepo.
3. Archive old split repos for 7 days.
4. Delete only after verifying no Vercel/Railway/GitHub secrets reference them.

## Non-Zivvy Repos In Org

These were present in the org snapshot and should be reviewed before removal:

- `Vestcodes/ovok-internal`
- `Vestcodes/analytics`
- `Vestcodes/ROS-v1`
- `Vestcodes/flavour-dash`
- `Vestcodes/property-erp`
- `Vestcodes/prototype-Ros-`
- `Vestcodes/empaitica`
- `Vestcodes/va-score`
- `Vestcodes/vest-os`
- `Vestcodes/landing`
- `Vestcodes/hush-crm`
- `Vestcodes/status-dashboard`
- `Vestcodes/signals`
- `Vestcodes/easycarehub`
- `Vestcodes/vestcodes-crm`
- `Vestcodes/sunny-portfolio`
- `Vestcodes/actimi-cost-reporting`
- `Vestcodes/easycarehub-backend`
- `Vestcodes/mini-ems`
- `Vestcodes/qa-actimi`
- `Vestcodes/actimi`
- `Vestcodes/ai-slop-react-landing`
- `Vestcodes/orchealth-backend`
- `Vestcodes/actimi-tracing`
- `Vestcodes/hw-backend`
- `Vestcodes/ehr-dashboard`
- `Vestcodes/operations`
- `Vestcodes/hwcrm-backend`
- `Vestcodes/portexa`
- `Vestcodes/HushAndWearCRM`
- `Vestcodes/wordrush`
- `Vestcodes/translation-service-india`
- `Vestcodes/ehr`
- `Vestcodes/nestjs-scaffold`
- `Vestcodes/nextjs-scaffold`
- `Vestcodes/emr-dashboard`
- `Vestcodes/vcecom`
- `Vestcodes/vestcodes-business-suite`
- `Vestcodes/hw-v2`
- `Vestcodes/meta-api`
- `Vestcodes/hw-storefront`
- `Vestcodes/vcbc`
- `Vestcodes/hush-and-wear-com`
- `Vestcodes/coolify`
- `Vestcodes/hush-and-wear-crm`
- `Vestcodes/ovok-internal-example`
- `Vestcodes/next-js-internal`
- `Vestcodes/vestcodes-internal`
- `Vestcodes/ems`
- `Vestcodes/umami`
- `Vestcodes/hwcrm`
- `Vestcodes/peflora-storefront`
- `Vestcodes/peflora-backend`
- `Vestcodes/peflora-admin`
- `Vestcodes/cdn`
- `Vestcodes/hwecom-rway`
- `Vestcodes/school-erp`
- `Vestcodes/school-erp-v2`
- `Vestcodes/ecommerce-test`
- `Vestcodes/peflora-scent-store`
- `Vestcodes/ecommerce`
- `Vestcodes/tools`
- `Vestcodes/restaurant-operating-system`
- `Vestcodes/varna-sanskriti`
- `Vestcodes/.github`

## Safe Archive Command

```bash
gh repo archive Vestcodes/<repo> --yes
```

## Destructive Delete Command

```bash
gh repo delete Vestcodes/<repo> --yes
```

Do not run delete commands until the exact repo list has been confirmed in chat.
