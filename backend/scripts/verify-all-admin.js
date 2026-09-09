async function main() {
  console.log("Testing Admin Endpoints...");
  try {
    const statsRes = await fetch("http://localhost:9000/admin/dashboard/stats");
    const stats = await statsRes.json();
    console.log("=== 1. /admin/dashboard/stats ===");
    console.log(JSON.stringify(stats, null, 2));

    const compRes = await fetch("http://localhost:9000/admin/composers?status=PENDING_APPROVAL");
    const comp = await compRes.json();
    console.log("=== 2. /admin/composers?status=PENDING_APPROVAL ===");
    console.log(JSON.stringify(comp, null, 2));

    const allCompRes = await fetch("http://localhost:9000/admin/composers");
    const allComp = await allCompRes.json();
    console.log("=== 3. /admin/composers (all) ===");
    console.log(JSON.stringify(allComp, null, 2));

    const commRes = await fetch("http://localhost:9000/admin/settings/commission");
    const comm = await commRes.json();
    console.log("=== 4. /admin/settings/commission ===");
    console.log(JSON.stringify(comm, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

main();
