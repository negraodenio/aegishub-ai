async function main() {
  console.log("MindOps workers running");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
