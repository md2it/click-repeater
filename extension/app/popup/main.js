
async function init() {
  await restorePopupPage();
  await cleanupLegacySettings();
  await initializeLocale();
  await readSettingsFromStorage();
  syncSettingsUI();
  syncPopupLocale();
  await refreshSupportSurveyAboutStatistic();
  await Promise.all([loadClicks(), loadComposites()]);
  const createdClick = await completeCreateModeIfNeeded();
  await stopActiveCheckMode();
  render();
  const executionStatus = await refreshExecutionStatus();
  if (executionStatus?.lastEvent?.kind === "completed") {
    if (await shouldShowSupportSurvey()) {
      await openSupportSurvey("useful");
    }
  }

  if (createdClick) {
    const manageBtn = document.querySelector(
      `.manage-btn[data-id="${CSS.escape(createdClick.id)}"]`
    );
    if (manageBtn) {
      openManageMenu(createdClick.id, manageBtn, { focusName: true });
    }
    playSaveAnimation(createdClick.id);
    setStatus(t("saved"));
    return;
  }

  // Do not replace a recent event or active execution status with the initial hint.
  if (executionStatus?.lastEvent?.kind) {
    return;
  }

  if (executionStatus?.state?.isRunning) {
    return;
  }

  setStatus("");
}

init();
