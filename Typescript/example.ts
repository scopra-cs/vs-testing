/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
    ReactConsumerType,
    ReactContext,
    ReactNodeList,
  } from 'shared/ReactTypes';
  import type {LazyComponent as LazyComponentType} from 'react/src/ReactLazy';
  import type {Fiber, FiberRoot} from './ReactInternalTypes';
  import type {TypeOfMode} from './ReactTypeOfMode';
  import type {Lanes, Lane} from './ReactFiberLane';
  import type {
    SuspenseState,
    SuspenseListRenderState,
    SuspenseListTailMode,
  } from './ReactFiberSuspenseComponent';
  import type {SuspenseContext} from './ReactFiberSuspenseContext';
  import type {
    OffscreenProps,
    OffscreenState,
    OffscreenQueue,
    OffscreenInstance,
  } from './ReactFiberActivityComponent';
  import {OffscreenDetached} from './ReactFiberActivityComponent';
  import type {
    Cache,
    CacheComponentState,
    SpawnedCachePool,
  } from './ReactFiberCacheComponent';
  import type {UpdateQueue} from './ReactFiberClassUpdateQueue';
  import type {RootState} from './ReactFiberRoot';
  import type {TracingMarkerInstance} from './ReactFiberTracingMarkerComponent';
  import type {TransitionStatus} from './ReactFiberConfig';
  import type {Hook} from './ReactFiberHooks';
  
  import {
    markComponentRenderStarted,
    markComponentRenderStopped,
    setIsStrictModeForDevtools,
  } from './ReactFiberDevToolsHook';
  import {
    IndeterminateComponent,
    FunctionComponent,
    ClassComponent,
    HostRoot,
    HostComponent,
    HostHoistable,
    HostSingleton,
    HostText,
    HostPortal,
    ForwardRef,
    Fragment,
    Mode,
    ContextProvider,
    ContextConsumer,
    Profiler,
    SuspenseComponent,
    SuspenseListComponent,
    MemoComponent,
    SimpleMemoComponent,
    LazyComponent,
    IncompleteClassComponent,
    ScopeComponent,
    OffscreenComponent,
    LegacyHiddenComponent,
    CacheComponent,
    TracingMarkerComponent,
  } from './ReactWorkTags';
  import {
    NoFlags,
    PerformedWork,
    Placement,
    Hydrating,
    ContentReset,
    DidCapture,
    Update,
    Ref,
    RefStatic,
    ChildDeletion,
    ForceUpdateForLegacySuspense,
    StaticMask,
    ShouldCapture,
    ForceClientRender,
    Passive,
    DidDefer,
  } from './ReactFiberFlags';
  import ReactSharedInternals from 'shared/ReactSharedInternals';
  import {
    debugRenderPhaseSideEffectsForStrictMode,
    disableLegacyContext,
    disableModulePatternComponents,
    enableProfilerCommitHooks,
    enableProfilerTimer,
    enableScopeAPI,
    enableCache,
    enableLazyContextPropagation,
    enableSchedulingProfiler,
    enableTransitionTracing,
    enableLegacyHidden,
    enableCPUSuspense,
    enableFloat,
    enableFormActions,
    enableAsyncActions,
    enablePostpone,
    enableRenderableContext,
    enableRefAsProp,
  } from 'shared/ReactFeatureFlags';
  import isArray from 'shared/isArray';
  import shallowEqual from 'shared/shallowEqual';
  import getComponentNameFromFiber from 'react-reconciler/src/getComponentNameFromFiber';
  import getComponentNameFromType from 'shared/getComponentNameFromType';
  import ReactStrictModeWarnings from './ReactStrictModeWarnings';
  import {REACT_LAZY_TYPE, getIteratorFn} from 'shared/ReactSymbols';
  import {
    getCurrentFiberOwnerNameInDevOrNull,
    setIsRendering,
  } from './ReactCurrentFiber';
  import {
    resolveFunctionForHotReloading,
    resolveForwardRefForHotReloading,
    resolveClassForHotReloading,
  } from './ReactFiberHotReloading';
  
  import {
    mountChildFibers,
    reconcileChildFibers,
    cloneChildFibers,
  } from './ReactChildFiber';
  import {
    processUpdateQueue,
    cloneUpdateQueue,
    initializeUpdateQueue,
    enqueueCapturedUpdate,
    suspendIfUpdateReadFromEntangledAsyncAction,
  } from './ReactFiberClassUpdateQueue';
  import {
    NoLane,
    NoLanes,
    SyncLane,
    OffscreenLane,
    DefaultHydrationLane,
    SomeRetryLane,
    includesSomeLane,
    laneToLanes,
    removeLanes,
    mergeLanes,
    getBumpedLaneForHydration,
    pickArbitraryLane,
  } from './ReactFiberLane';
  import {
    ConcurrentMode,
    NoMode,
    ProfileMode,
    StrictLegacyMode,
  } from './ReactTypeOfMode';
  import {
    shouldSetTextContent,
    isSuspenseInstancePending,
    isSuspenseInstanceFallback,
    getSuspenseInstanceFallbackErrorDetails,
    registerSuspenseInstanceRetry,
    supportsHydration,
    supportsResources,
    supportsSingletons,
    isPrimaryRenderer,
    getResource,
    createHoistableInstance,
  } from './ReactFiberConfig';
  import type {SuspenseInstance} from './ReactFiberConfig';
  import {shouldError, shouldSuspend} from './ReactFiberReconciler';
  import {
    pushHostContext,
    pushHostContainer,
    getRootHostContainer,
    HostTransitionContext,
  } from './ReactFiberHostContext';
  import {
    suspenseStackCursor,
    pushSuspenseListContext,
    ForceSuspenseFallback,
    hasSuspenseListContext,
    setDefaultShallowSuspenseListContext,
    setShallowSuspenseListContext,
    pushPrimaryTreeSuspenseHandler,
    pushFallbackTreeSuspenseHandler,
    pushOffscreenSuspenseHandler,
    reuseSuspenseHandlerOnStack,
    popSuspenseHandler,
  } from './ReactFiberSuspenseContext';
  import {
    pushHiddenContext,
    reuseHiddenContextOnStack,
  } from './ReactFiberHiddenContext';
  import {findFirstSuspended} from './ReactFiberSuspenseComponent';
  import {
    pushProvider,
    propagateContextChange,
    lazilyPropagateParentContextChanges,
    propagateParentContextChangesToDeferredTree,
    checkIfContextChanged,
    readContext,
    prepareToReadContext,
    scheduleContextWorkOnParentPath,
  } from './ReactFiberNewContext';
  import {
    renderWithHooks,
    checkDidRenderIdHook,
    bailoutHooks,
    replaySuspendedComponentWithHooks,
    renderTransitionAwareHostComponentWithHooks,
  } from './ReactFiberHooks';
  import {stopProfilerTimerIfRunning} from './ReactProfilerTimer';
  import {
    getMaskedContext,
    getUnmaskedContext,
    hasContextChanged as hasLegacyContextChanged,
    pushContextProvider as pushLegacyContextProvider,
    isContextProvider as isLegacyContextProvider,
    pushTopLevelContextObject,
    invalidateContextProvider,
  } from './ReactFiberContext';
  import {
    getIsHydrating,
    enterHydrationState,
    reenterHydrationStateFromDehydratedSuspenseInstance,
    resetHydrationState,
    claimHydratableSingleton,
    tryToClaimNextHydratableInstance,
    tryToClaimNextHydratableTextInstance,
    tryToClaimNextHydratableSuspenseInstance,
    warnIfHydrating,
    queueHydrationError,
  } from './ReactFiberHydrationContext';
  import {
    adoptClassInstance,
    constructClassInstance,
    mountClassInstance,
    resumeMountClassInstance,
    updateClassInstance,
  } from './ReactFiberClassComponent';
  import {resolveDefaultProps} from './ReactFiberLazyComponent';
  import {
    resolveLazyComponentTag,
    createFiberFromTypeAndProps,
    createFiberFromFragment,
    createFiberFromOffscreen,
    createWorkInProgress,
    isSimpleFunctionComponent,
  } from './ReactFiber';
  import {
    retryDehydratedSuspenseBoundary,
    scheduleUpdateOnFiber,
    renderDidSuspendDelayIfPossible,
    markSkippedUpdateLanes,
    getWorkInProgressRoot,
    peekDeferredLane,
  } from './ReactFiberWorkLoop';
  import {enqueueConcurrentRenderForLane} from './ReactFiberConcurrentUpdates';
  import {pushCacheProvider, CacheContext} from './ReactFiberCacheComponent';
  import {
    createCapturedValueFromError,
    createCapturedValueAtFiber,
    type CapturedValue,
  } from './ReactCapturedValue';
  import {createClassErrorUpdate} from './ReactFiberThrow';
  import is from 'shared/objectIs';
  import {
    getForksAtLevel,
    isForkedChild,
    pushTreeId,
    pushMaterializedTreeId,
  } from './ReactFiberTreeContext';
  import {
    requestCacheFromPool,
    pushRootTransition,
    getSuspendedCache,
    pushTransition,
    getOffscreenDeferredCache,
    getPendingTransitions,
  } from './ReactFiberTransition';
  import {
    getMarkerInstances,
    pushMarkerInstance,
    pushRootMarkerInstance,
    TransitionTracingMarker,
  } from './ReactFiberTracingMarkerComponent';
  
  const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
  
  // A special exception that's used to unwind the stack when an update flows
  // into a dehydrated boundary.
  export const SelectiveHydrationException: mixed = new Error(
    "This is not a real error. It's an implementation detail of React's " +
      "selective hydration feature. If this leaks into userspace, it's a bug in " +
      'React. Please file an issue.',
  );
  
  let didReceiveUpdate: boolean = false;
  
  let didWarnAboutBadClass;
  let didWarnAboutModulePatternComponent;
  let didWarnAboutContextTypeOnFunctionComponent;
  let didWarnAboutGetDerivedStateOnFunctionComponent;
  let didWarnAboutFunctionRefs;
  export let didWarnAboutReassigningProps: boolean;
  let didWarnAboutRevealOrder;
  let didWarnAboutTailOptions;
  let didWarnAboutDefaultPropsOnFunctionComponent;
  
  if (__DEV__) {
    didWarnAboutBadClass = ({}: {[string]: boolean});
    didWarnAboutModulePatternComponent = ({}: {[string]: boolean});
    didWarnAboutContextTypeOnFunctionComponent = ({}: {[string]: boolean});
    didWarnAboutGetDerivedStateOnFunctionComponent = ({}: {[string]: boolean});
    didWarnAboutFunctionRefs = ({}: {[string]: boolean});
    didWarnAboutReassigningProps = false;
    didWarnAboutRevealOrder = ({}: {[empty]: boolean});
    didWarnAboutTailOptions = ({}: {[string]: boolean});
    didWarnAboutDefaultPropsOnFunctionComponent = ({}: {[string]: boolean});
  }
  
  export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderLanes: Lanes,
  ) {
    if (current === null) {
      // If this is a fresh new component that hasn't been rendered yet, we
      // won't update its child set by applying minimal side-effects. Instead,
      // we will add them all to the child before it gets rendered. That means
      // we can optimize this reconciliation pass by not tracking side-effects.
      workInProgress.child = mountChildFibers(
        workInProgress,
        null,
        nextChildren,
        renderLanes,
      );
    } else {
      // If the current child is the same as the work in progress, it means that
      // we haven't yet started any work on these children. Therefore, we use
      // the clone algorithm to create a copy of all the current children.
  
      // If we had any progressed work already, that is invalid at this point so
      // let's throw it out.
      workInProgress.child = reconcileChildFibers(
        workInProgress,
        current.child,
        nextChildren,
        renderLanes,
      );
    }
  }
  
  function forceUnmountCurrentAndReconcile(
    current: Fiber,
    workInProgress: Fiber,
    nextChildren: any,
    renderLanes: Lanes,
  ) {
    // This function is fork of reconcileChildren. It's used in cases where we
    // want to reconcile without matching against the existing set. This has the
    // effect of all current children being unmounted; even if the type and key
    // are the same, the old child is unmounted and a new child is created.
    //
    // To do this, we're going to go through the reconcile algorithm twice. In
    // the first pass, we schedule a deletion for all the current children by
    // passing null.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      null,
      renderLanes,
    );
    // In the second pass, we mount the new children. The trick here is that we
    // pass null in place of where we usually pass the current child set. This has
    // the effect of remounting all children regardless of whether their
    // identities match.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  }
  
  function updateForwardRef(
    current: Fiber | null,
    workInProgress: Fiber
  ) {
    // TODO: current can be non-null here even if the component
    // hasn't yet mounted. This happens after the first render suspends.
    // We'll need to figure out if this is fine or can cause issues.
    const render = Component.render;
    const ref = workInProgress.ref;
  
    let propsWithoutRef;
    if (enableRefAsProp && 'ref' in nextProps) {
      // `ref` is just a prop now, but `forwardRef` expects it to not appear in
      // the props object. This used to happen in the JSX runtime, but now we do
      // it here.
      propsWithoutRef = ({}: {[string]: any});
      for (const key in nextProps) {
        // Since `ref` should only appear in props via the JSX transform, we can
        // assume that this is a plain object. So we don't need a
        // hasOwnProperty check.
        if (key !== 'ref') {
          propsWithoutRef[key] = nextProps[key];
        }
      }
    } else {
      propsWithoutRef = nextProps;
    }
  
    // The rest is a fork of updateFunctionComponent
    let nextChildren;
    let hasId;
    prepareToReadContext(workInProgress, renderLanes);
    if (enableSchedulingProfiler) {
      markComponentRenderStarted(workInProgress);
    }
    if (__DEV__) {
      ReactCurrentOwner.current = workInProgress;
      setIsRendering(true);
      nextChildren = renderWithHooks(
        current,
        workInProgress,
        render,
        propsWithoutRef,
        ref,
        renderLanes,
      );
      hasId = checkDidRenderIdHook();
      setIsRendering(false);
    } else {
      nextChildren = renderWithHooks(
        current,
        workInProgress,
        render,
        propsWithoutRef,
        ref,
        renderLanes,
      );
      hasId = checkDidRenderIdHook();
    }
    if (enableSchedulingProfiler) {
      markComponentRenderStopped();
    }
  
    if (current !== null && !didReceiveUpdate) {
      bailoutHooks(current, workInProgress, renderLanes);
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
  
    if (getIsHydrating() && hasId) {
      pushMaterializedTreeId(workInProgress);
    }
  
    // React DevTools reads this flag.
    workInProgress.flags |= PerformedWork;
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
  }
  
  function updateMemoComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps: any,
    renderLanes: Lanes,
  ): null | Fiber {
    if (current === null) {
      const type = Component.type;
      if (
        isSimpleFunctionComponent(type) &&
        Component.compare === null &&
        // SimpleMemoComponent codepath doesn't resolve outer props either.
        Component.defaultProps === undefined
      ) {
        let resolvedType = type;
        if (__DEV__) {
          resolvedType = resolveFunctionForHotReloading(type);
        }
        // If this is a plain function component without default props,
        // and with only the default shallow comparison, we upgrade it
        // to a SimpleMemoComponent to allow fast path updates.
        workInProgress.tag = SimpleMemoComponent;
        workInProgress.type = resolvedType;
        if (__DEV__) {
          validateFunctionComponentInDev(workInProgress, type);
        }
        return updateSimpleMemoComponent(
          current,
          workInProgress,
          resolvedType,
          nextProps,
          renderLanes,
        );
      }
      if (__DEV__) {
        if (Component.defaultProps !== undefined) {
          const componentName = getComponentNameFromType(type) || 'Unknown';
          if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
            console.error(
              '%s: Support for defaultProps will be removed from memo components ' +
                'in a future major release. Use JavaScript default parameters instead.',
              componentName,
            );
            didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
          }
        }
      }
      const child = createFiberFromTypeAndProps(
        Component.type,
        null,
        nextProps,
        workInProgress,
        workInProgress.mode,
        renderLanes,
      );
      child.ref = workInProgress.ref;
      child.return = workInProgress;
      workInProgress.child = child;
      return child;
    }
    const currentChild = ((current.child: any): Fiber); // This is always exactly one child
    const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
      current,
      renderLanes,
    );
    if (!hasScheduledUpdateOrContext) {
      // This will be the props with resolved defaultProps,
      // unlike current.memoizedProps which will be the unresolved ones.
      const prevProps = currentChild.memoizedProps;
      // Default to shallow comparison
      let compare = Component.compare;
      compare = compare !== null ? compare : shallowEqual;
      if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
      }
    }
    // React DevTools reads this flag.
    workInProgress.flags |= PerformedWork;
    const newChild = createWorkInProgress(currentChild, nextProps);
    newChild.ref = workInProgress.ref;
    newChild.return = workInProgress;
    workInProgress.child = newChild;
    return newChild;
  }
  
  function updateSimpleMemoComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps: any,
    renderLanes: Lanes,
  ): null | Fiber {
    // TODO: current can be non-null here even if the component
    // hasn't yet mounted. This happens when the inner render suspends.
    // We'll need to figure out if this is fine or can cause issues.
    if (current !== null) {
      const prevProps = current.memoizedProps;
      if (
        shallowEqual(prevProps, nextProps) &&
        current.ref === workInProgress.ref &&
        // Prevent bailout if the implementation changed due to hot reload.
        (__DEV__ ? workInProgress.type === current.type : true)
      ) {
        didReceiveUpdate = false;
  
        // The props are shallowly equal. Reuse the previous props object, like we
        // would during a normal fiber bailout.
        //
        // We don't have strong guarantees that the props object is referentially
        // equal during updates where we can't bail out anyway — like if the props
        // are shallowly equal, but there's a local state or context update in the
        // same batch.
        //
        // However, as a principle, we should aim to make the behavior consistent
        // across different ways of memoizing a component. For example, React.memo
        // has a different internal Fiber layout if you pass a normal function
        // component (SimpleMemoComponent) versus if you pass a different type
        // like forwardRef (MemoComponent). But this is an implementation detail.
        // Wrapping a component in forwardRef (or React.lazy, etc) shouldn't
        // affect whether the props object is reused during a bailout.
        workInProgress.pendingProps = nextProps = prevProps;
  
        if (!checkScheduledUpdateOrContext(current, renderLanes)) {
          // The pending lanes were cleared at the beginning of beginWork. We're
          // about to bail out, but there might be other lanes that weren't
          // included in the current render. Usually, the priority level of the
          // remaining updates is accumulated during the evaluation of the
          // component (i.e. when processing the update queue). But since since
          // we're bailing out early *without* evaluating the component, we need
          // to account for it here, too. Reset to the value of the current fiber.
          // NOTE: This only applies to SimpleMemoComponent, not MemoComponent,
          // because a MemoComponent fiber does not have hooks or an update queue;
          // rather, it wraps around an inner component, which may or may not
          // contains hooks.
          // TODO: Move the reset at in beginWork out of the common path so that
          // this is no longer necessary.
          workInProgress.lanes = current.lanes;
          return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderLanes,
          );
        } else if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
          // This is a special case that only exists for legacy mode.
          // See https://github.com/facebook/react/pull/19216.
          didReceiveUpdate = true;
        }
      }
    }
    return updateFunctionComponent(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes,
    );
  }
  
  function updateOffscreenComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    const nextProps: OffscreenProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    const nextIsDetached =
      (workInProgress.stateNode._pendingVisibility & OffscreenDetached) !== 0;
  
    const prevState: OffscreenState | null =
      current !== null ? current.memoizedState : null;
  
    markRef(current, workInProgress);
  
    if (
      nextProps.mode === 'hidden' ||
      (enableLegacyHidden &&
        nextProps.mode === 'unstable-defer-without-hiding') ||
      nextIsDetached
    ) {
      // Rendering a hidden tree.
  
      const didSuspend = (workInProgress.flags & DidCapture) !== NoFlags;
      if (didSuspend) {
        // Something suspended inside a hidden tree
  
        // Include the base lanes from the last render
        const nextBaseLanes =
          prevState !== null
            ? mergeLanes(prevState.baseLanes, renderLanes)
            : renderLanes;
  
        if (current !== null) {
          // Reset to the current children
          let currentChild = (workInProgress.child = current.child);
  
          // The current render suspended, but there may be other lanes with
          // pending work. We can't read `childLanes` from the current Offscreen
          // fiber because we reset it when it was deferred; however, we can read
          // the pending lanes from the child fibers.
          let currentChildLanes = NoLanes;
          while (currentChild !== null) {
            currentChildLanes = mergeLanes(
              mergeLanes(currentChildLanes, currentChild.lanes),
              currentChild.childLanes,
            );
            currentChild = currentChild.sibling;
          }
          const lanesWeJustAttempted = nextBaseLanes;
          const remainingChildLanes = removeLanes(
            currentChildLanes,
            lanesWeJustAttempted,
          );
          workInProgress.childLanes = remainingChildLanes;
        } else {
          workInProgress.childLanes = NoLanes;
          workInProgress.child = null;
        }
  
        return deferHiddenOffscreenComponent(
          current,
          workInProgress,
          nextBaseLanes,
          renderLanes,
        );
      }
  
      if ((workInProgress.mode & ConcurrentMode) === NoMode) {
        // In legacy sync mode, don't defer the subtree. Render it now.
        // TODO: Consider how Offscreen should work with transitions in the future
        const nextState: OffscreenState = {
          baseLanes: NoLanes,
          cachePool: null,
        };
        workInProgress.memoizedState = nextState;
        if (enableCache) {
          // push the cache pool even though we're going to bail out
          // because otherwise there'd be a context mismatch
          if (current !== null) {
            pushTransition(workInProgress, null, null);
          }
        }
        reuseHiddenContextOnStack(workInProgress);
        pushOffscreenSuspenseHandler(workInProgress);
      } else if (!includesSomeLane(renderLanes, (OffscreenLane: Lane))) {
        // We're hidden, and we're not rendering at Offscreen. We will bail out
        // and resume this tree later.
  
        // Schedule this fiber to re-render at Offscreen priority
        workInProgress.lanes = workInProgress.childLanes =
          laneToLanes(OffscreenLane);
  
        // Include the base lanes from the last render
        const nextBaseLanes =
          prevState !== null
            ? mergeLanes(prevState.baseLanes, renderLanes)
            : renderLanes;
  
        return deferHiddenOffscreenComponent(
          current,
          workInProgress,
          nextBaseLanes,
          renderLanes,
        );
      } else {
        // This is the second render. The surrounding visible content has already
        // committed. Now we resume rendering the hidden tree.
  
        // Rendering at offscreen, so we can clear the base lanes.
        const nextState: OffscreenState = {
          baseLanes: NoLanes,
          cachePool: null,
        };
        workInProgress.memoizedState = nextState;
        if (enableCache && current !== null) {
          // If the render that spawned this one accessed the cache pool, resume
          // using the same cache. Unless the parent changed, since that means
          // there was a refresh.
          const prevCachePool = prevState !== null ? prevState.cachePool : null;
          // TODO: Consider if and how Offscreen pre-rendering should
          // be attributed to the transition that spawned it
          pushTransition(workInProgress, prevCachePool, null);
        }
  
        // Push the lanes that were skipped when we bailed out.
        if (prevState !== null) {
          pushHiddenContext(workInProgress, prevState);
        } else {
          reuseHiddenContextOnStack(workInProgress);
        }
        pushOffscreenSuspenseHandler(workInProgress);
      }
    } else {
      // Rendering a visible tree.
      if (prevState !== null) {
        // We're going from hidden -> visible.
        let prevCachePool = null;
        if (enableCache) {
          // If the render that spawned this one accessed the cache pool, resume
          // using the same cache. Unless the parent changed, since that means
          // there was a refresh.
          prevCachePool = prevState.cachePool;
        }
  
        let transitions = null;
        if (enableTransitionTracing) {
          // We have now gone from hidden to visible, so any transitions should
          // be added to the stack to get added to any Offscreen/suspense children
          const instance: OffscreenInstance | null = workInProgress.stateNode;
          if (instance !== null && instance._transitions != null) {
            transitions = Array.from(instance._transitions);
          }
        }
  
        pushTransition(workInProgress, prevCachePool, transitions);
  
        // Push the lanes that were skipped when we bailed out.
        pushHiddenContext(workInProgress, prevState);
        reuseSuspenseHandlerOnStack(workInProgress);
  
        // Since we're not hidden anymore, reset the state
        workInProgress.memoizedState = null;
      } else {
        // We weren't previously hidden, and we still aren't, so there's nothing
        // special to do. Need to push to the stack regardless, though, to avoid
        // a push/pop misalignment.
  
        if (enableCache) {
          // If the render that spawned this one accessed the cache pool, resume
          // using the same cache. Unless the parent changed, since that means
          // there was a refresh.
          if (current !== null) {
            pushTransition(workInProgress, null, null);
          }
        }
  
        // We're about to bail out, but we need to push this to the stack anyway
        // to avoid a push/pop misalignment.
        reuseHiddenContextOnStack(workInProgress);
        reuseSuspenseHandlerOnStack(workInProgress);
      }
    }
  
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
  }
  
   function updatePortalComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
    const nextChildren = workInProgress.pendingProps;
    if (current === null) {
      // Portals are special because we don't append the children during mount
      // but at commit. Therefore we need to track insertions which the normal
      // flow doesn't do during mount. This doesn't happen at the root because
      // the root always starts with a "current" with a null child.
      // TODO: Consider unifying this with how the root works.
      workInProgress.child = reconcileChildFibers(
        workInProgress,
        null,
        nextChildren,
        renderLanes,
      );
    } else {
      reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    }
    return workInProgress.child;
  }
  
  let hasWarnedAboutUsingNoValuePropOnContextProvider = false;
  
  function updateContextProvider(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    let context: ReactContext<any>;
    if (enableRenderableContext) {
      context = workInProgress.type;
    } else {
      context = workInProgress.type._context;
    }
    const newProps = workInProgress.pendingProps;
    const oldProps = workInProgress.memoizedProps;
  
    const newValue = newProps.value;
  
    if (__DEV__) {
      if (!('value' in newProps)) {
        if (!hasWarnedAboutUsingNoValuePropOnContextProvider) {
          hasWarnedAboutUsingNoValuePropOnContextProvider = true;
          console.error(
            'The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?',
          );
        }
      }
    }
  
    pushProvider(workInProgress, context, newValue);
  
    if (enableLazyContextPropagation) {
      // In the lazy propagation implementation, we don't scan for matching
      // consumers until something bails out, because until something bails out
      // we're going to visit those nodes, anyway. The trade-off is that it shifts
      // responsibility to the consumer to track whether something has changed.
    } else {
      if (oldProps !== null) {
        const oldValue = oldProps.value;
        if (is(oldValue, newValue)) {
          // No change. Bailout early if children are the same.
          if (
            oldProps.children === newProps.children &&
            !hasLegacyContextChanged()
          ) {
            return bailoutOnAlreadyFinishedWork(
              current,
              workInProgress,
              renderLanes,
            );
          }
        } else {
          // The context value changed. Search for matching consumers and schedule
          // them to update.
          propagateContextChange(workInProgress, context, renderLanes);
        }
      }
    }
  
    const newChildren = newProps.children;
    reconcileChildren(current, workInProgress, newChildren, renderLanes);
    return workInProgress.child;
  }
  
  function updateContextConsumer(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    let context: ReactContext<any>;
    if (enableRenderableContext) {
      const consumerType: ReactConsumerType<any> = workInProgress.type;
      context = consumerType._context;
    } else {
      context = workInProgress.type;
      if (__DEV__) {
        if ((context: any)._context !== undefined) {
          context = (context: any)._context;
        }
      }
    }
    const newProps = workInProgress.pendingProps;
    const render = newProps.children;
  
    if (__DEV__) {
      if (typeof render !== 'function') {
        console.error(
          'A context consumer was rendered with multiple children, or a child ' +
            "that isn't a function. A context consumer expects a single child " +
            'that is a function. If you did pass a function, make sure there ' +
            'is no trailing or leading whitespace around it.',
        );
      }
    }
  
    prepareToReadContext(workInProgress, renderLanes);
    const newValue = readContext(context);
    if (enableSchedulingProfiler) {
      markComponentRenderStarted(workInProgress);
    }
    let newChildren;
    if (__DEV__) {
      ReactCurrentOwner.current = workInProgress;
      setIsRendering(true);
      newChildren = render(newValue);
      setIsRendering(false);
    } else {
      newChildren = render(newValue);
    }
    if (enableSchedulingProfiler) {
      markComponentRenderStopped();
    }
  
    // React DevTools reads this flag.
    workInProgress.flags |= PerformedWork;
    reconcileChildren(current, workInProgress, newChildren, renderLanes);
    return workInProgress.child;
  }
  
  function updateScopeComponent(
    current: null | Fiber,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    const nextProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    markRef(current, workInProgress);
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
  }
  
  export function markWorkInProgressReceivedUpdate() {
    didReceiveUpdate = true;
  }
  
  export function checkIfWorkInProgressReceivedUpdate(): boolean {
    return didReceiveUpdate;
  }
  
  function resetSuspendedCurrentOnMountInLegacyMode(
    current: null | Fiber,
    workInProgress: Fiber,
  ) {
    if ((workInProgress.mode & ConcurrentMode) === NoMode) {
      if (current !== null) {
        // A lazy component only mounts if it suspended inside a non-
        // concurrent tree, in an inconsistent state. We want to treat it like
        // a new mount, even though an empty version of it already committed.
        // Disconnect the alternate pointers.
        current.alternate = null;
        workInProgress.alternate = null;
        // Since this is conceptually a new fiber, schedule a Placement effect
        workInProgress.flags |= Placement;
      }
    }
  }
  
  function bailoutOnAlreadyFinishedWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ): Fiber | null {
    if (current !== null) {
      // Reuse previous dependencies
      workInProgress.dependencies = current.dependencies;
    }
  
    if (enableProfilerTimer) {
      // Don't update "base" render times for bailouts.
      stopProfilerTimerIfRunning(workInProgress);
    }
  
    markSkippedUpdateLanes(workInProgress.lanes);
  
    // Check if the children have any pending work.
    if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
      // The children don't have any work either. We can skip them.
      // TODO: Once we add back resuming, we should check if the children are
      // a work-in-progress set. If so, we need to transfer their effects.
  
      if (enableLazyContextPropagation && current !== null) {
        // Before bailing out, check if there are any context changes in
        // the children.
        lazilyPropagateParentContextChanges(current, workInProgress, renderLanes);
        if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
          return null;
        }
      } else {
        return null;
      }
    }
  
    // This fiber doesn't have work, but its subtree does. Clone the child
    // fibers and continue.
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
  }
  
  function remountFiber(
    current: Fiber,
    oldWorkInProgress: Fiber,
    newWorkInProgress: Fiber,
  ): Fiber | null {
    if (__DEV__) {
      const returnFiber = oldWorkInProgress.return;
      if (returnFiber === null) {
        // eslint-disable-next-line react-internal/prod-error-codes
        throw new Error('Cannot swap the root fiber.');
      }
  
      // Disconnect from the old current.
      // It will get deleted.
      current.alternate = null;
      oldWorkInProgress.alternate = null;
  
      // Connect to the new tree.
      newWorkInProgress.index = oldWorkInProgress.index;
      newWorkInProgress.sibling = oldWorkInProgress.sibling;
      newWorkInProgress.return = oldWorkInProgress.return;
      newWorkInProgress.ref = oldWorkInProgress.ref;
  
      if (__DEV__) {
        newWorkInProgress._debugInfo = oldWorkInProgress._debugInfo;
      }
  
      // Replace the child/sibling pointers above it.
      if (oldWorkInProgress === returnFiber.child) {
        returnFiber.child = newWorkInProgress;
      } else {
        let prevSibling = returnFiber.child;
        if (prevSibling === null) {
          // eslint-disable-next-line react-internal/prod-error-codes
          throw new Error('Expected parent to have a child.');
        }
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        while (prevSibling.sibling !== oldWorkInProgress) {
          // $FlowFixMe[incompatible-use] found when upgrading Flow
          prevSibling = prevSibling.sibling;
          if (prevSibling === null) {
            // eslint-disable-next-line react-internal/prod-error-codes
            throw new Error('Expected to find the previous sibling.');
          }
        }
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        prevSibling.sibling = newWorkInProgress;
      }
  
      // Delete the old fiber and place the new one.
      // Since the old fiber is disconnected, we have to schedule it manually.
      const deletions = returnFiber.deletions;
      if (deletions === null) {
        returnFiber.deletions = [current];
        returnFiber.flags |= ChildDeletion;
      } else {
        deletions.push(current);
      }
  
      newWorkInProgress.flags |= Placement;
  
      // Restart work from the new fiber.
      return newWorkInProgress;
    } else {
      throw new Error(
        'Did not expect this call in production. ' +
          'This is a bug in React. Please file an issue.',
      );
    }
  }
  
  function checkScheduledUpdateOrContext(
    current: Fiber,
    renderLanes: Lanes,
  ): boolean {
    // Before performing an early bailout, we must check if there are pending
    // updates or context.
    const updateLanes = current.lanes;
    if (includesSomeLane(updateLanes, renderLanes)) {
      return true;
    }
    // No pending update, but because context is propagated lazily, we need
    // to check for a context change before we bail out.
    if (enableLazyContextPropagation) {
      const dependencies = current.dependencies;
      if (dependencies !== null && checkIfContextChanged(dependencies)) {
        return true;
      }
    }
    return false;
  }
  
  function attemptEarlyBailoutIfNoScheduledUpdate(
    current: Fiber,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ) {
    // This fiber does not have any pending work. Bailout without entering
    // the begin phase. There's still some bookkeeping we that needs to be done
    // in this optimized path, mostly pushing stuff onto the stack.
    switch (workInProgress.tag) {
      case HostRoot:
        pushHostRootContext(workInProgress);
        const root: FiberRoot = workInProgress.stateNode;
        pushRootTransition(workInProgress, root, renderLanes);
  
        if (enableTransitionTracing) {
          pushRootMarkerInstance(workInProgress);
        }
  
        if (enableCache) {
          const cache: Cache = current.memoizedState.cache;
          pushCacheProvider(workInProgress, cache);
        }
        resetHydrationState();
        break;
      case HostSingleton:
      case HostComponent:
        pushHostContext(workInProgress);
        break;
      case ClassComponent: {
        const Component = workInProgress.type;
        if (isLegacyContextProvider(Component)) {
          pushLegacyContextProvider(workInProgress);
        }
        break;
      }
      case HostPortal:
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        break;
      case ContextProvider: {
        const newValue = workInProgress.memoizedProps.value;
        let context: ReactContext<any>;
        if (enableRenderableContext) {
          context = workInProgress.type;
        } else {
          context = workInProgress.type._context;
        }
        pushProvider(workInProgress, context, newValue);
        break;
      }
      case Profiler:
        if (enableProfilerTimer) {
          // Profiler should only call onRender when one of its descendants actually rendered.
          const hasChildWork = includesSomeLane(
            renderLanes,
            workInProgress.childLanes,
          );
          if (hasChildWork) {
            workInProgress.flags |= Update;
          }
  
          if (enableProfilerCommitHooks) {
            // Reset effect durations for the next eventual effect phase.
            // These are reset during render to allow the DevTools commit hook a chance to read them,
            const stateNode = workInProgress.stateNode;
            stateNode.effectDuration = 0;
            stateNode.passiveEffectDuration = 0;
          }
        }
        break;
      case SuspenseComponent: {
        const state: SuspenseState | null = workInProgress.memoizedState;
        if (state !== null) {
          if (state.dehydrated !== null) {
            // We're not going to render the children, so this is just to maintain
            // push/pop symmetry
            pushPrimaryTreeSuspenseHandler(workInProgress);
            // We know that this component will suspend again because if it has
            // been unsuspended it has committed as a resolved Suspense component.
            // If it needs to be retried, it should have work scheduled on it.
            workInProgress.flags |= DidCapture;
            // We should never render the children of a dehydrated boundary until we
            // upgrade it. We return null instead of bailoutOnAlreadyFinishedWork.
            return null;
          }
  
          // If this boundary is currently timed out, we need to decide
          // whether to retry the primary children, or to skip over it and
          // go straight to the fallback. Check the priority of the primary
          // child fragment.
          const primaryChildFragment: Fiber = (workInProgress.child: any);
          const primaryChildLanes = primaryChildFragment.childLanes;
          if (includesSomeLane(renderLanes, primaryChildLanes)) {
            // The primary children have pending work. Use the normal path
            // to attempt to render the primary children again.
            return updateSuspenseComponent(current, workInProgress, renderLanes);
          } else {
            // The primary child fragment does not have pending work marked
            // on it
            pushPrimaryTreeSuspenseHandler(workInProgress);
            // The primary children do not have pending work with sufficient
            // priority. Bailout.
            const child = bailoutOnAlreadyFinishedWork(
              current,
              workInProgress,
              renderLanes,
            );
            if (child !== null) {
              // The fallback children have pending work. Skip over the
              // primary children and work on the fallback.
              return child.sibling;
            } else {
              // Note: We can return `null` here because we already checked
              // whether there were nested context consumers, via the call to
              // `bailoutOnAlreadyFinishedWork` above.
              return null;
            }
          }
        } else {
          pushPrimaryTreeSuspenseHandler(workInProgress);
        }
        break;
      }
      case SuspenseListComponent: {
        const didSuspendBefore = (current.flags & DidCapture) !== NoFlags;
  
        let hasChildWork = includesSomeLane(
          renderLanes,
          workInProgress.childLanes,
        );
  
        if (enableLazyContextPropagation && !hasChildWork) {
          // Context changes may not have been propagated yet. We need to do
          // that now, before we can decide whether to bail out.
          // TODO: We use `childLanes` as a heuristic for whether there is
          // remaining work in a few places, including
          // `bailoutOnAlreadyFinishedWork` and
          // `updateDehydratedSuspenseComponent`. We should maybe extract this
          // into a dedicated function.
          lazilyPropagateParentContextChanges(
            current,
            workInProgress,
            renderLanes,
          );
          hasChildWork = includesSomeLane(renderLanes, workInProgress.childLanes);
        }
  
        if (didSuspendBefore) {
          if (hasChildWork) {
            // If something was in fallback state last time, and we have all the
            // same children then we're still in progressive loading state.
            // Something might get unblocked by state updates or retries in the
            // tree which will affect the tail. So we need to use the normal
            // path to compute the correct tail.
            return updateSuspenseListComponent(
              current,
              workInProgress,
              renderLanes,
            );
          }
          // If none of the children had any work, that means that none of
          // them got retried so they'll still be blocked in the same way
          // as before. We can fast bail out.
          workInProgress.flags |= DidCapture;
        }
  
        // If nothing suspended before and we're rendering the same children,
        // then the tail doesn't matter. Anything new that suspends will work
        // in the "together" mode, so we can continue from the state we had.
        const renderState = workInProgress.memoizedState;
        if (renderState !== null) {
          // Reset to the "together" mode in case we've started a different
          // update in the past but didn't complete it.
          renderState.rendering = null;
          renderState.tail = null;
          renderState.lastEffect = null;
        }
        pushSuspenseListContext(workInProgress, suspenseStackCursor.current);
  
        if (hasChildWork) {
          break;
        } else {
          // If none of the children had any work, that means that none of
          // them got retried so they'll still be blocked in the same way
          // as before. We can fast bail out.
          return null;
        }
      }
      case OffscreenComponent:
      case LegacyHiddenComponent: {
        // Need to check if the tree still needs to be deferred. This is
        // almost identical to the logic used in the normal update path,
        // so we'll just enter that. The only difference is we'll bail out
        // at the next level instead of this one, because the child props
        // have not changed. Which is fine.
        // TODO: Probably should refactor `beginWork` to split the bailout
        // path from the normal path. I'm tempted to do a labeled break here
        // but I won't :)
        workInProgress.lanes = NoLanes;
        return updateOffscreenComponent(current, workInProgress, renderLanes);
      }
      case CacheComponent: {
        if (enableCache) {
          const cache: Cache = current.memoizedState.cache;
          pushCacheProvider(workInProgress, cache);
        }
        break;
      }
      case TracingMarkerComponent: {
        if (enableTransitionTracing) {
          const instance: TracingMarkerInstance | null = workInProgress.stateNode;
          if (instance !== null) {
            pushMarkerInstance(workInProgress, instance);
          }
        }
      }
    }
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  
  function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
  ): Fiber | null {
    if (__DEV__) {
      if (workInProgress._debugNeedsRemount && current !== null) {
        // This will restart the begin phase with a new fiber.
        return remountFiber(
          current,
          workInProgress,
          createFiberFromTypeAndProps(
            workInProgress.type,
            workInProgress.key,
            workInProgress.pendingProps,
            workInProgress._debugOwner || null,
            workInProgress.mode,
            workInProgress.lanes,
          ),
        );
      }
    }
  
    if (current !== null) {
      const oldProps = current.memoizedProps;
      const newProps = workInProgress.pendingProps;
  
      if (
        oldProps !== newProps ||
        hasLegacyContextChanged() ||
        // Force a re-render if the implementation changed due to hot reload:
        (__DEV__ ? workInProgress.type !== current.type : false)
      ) {
        // If props or context changed, mark the fiber as having performed work.
        // This may be unset if the props are determined to be equal later (memo).
        didReceiveUpdate = true;
      } else {
        // Neither props nor legacy context changes. Check if there's a pending
        // update or context change.
        const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
          current,
          renderLanes,
        );
        if (
          !hasScheduledUpdateOrContext &&
          // If this is the second pass of an error or suspense boundary, there
          // may not be work scheduled on `current`, so we check for this flag.
          (workInProgress.flags & DidCapture) === NoFlags
        ) {
          // No pending updates or context. Bail out now.
          didReceiveUpdate = false;
          return attemptEarlyBailoutIfNoScheduledUpdate(
            current,
            workInProgress,
            renderLanes,
          );
        }
        if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
          // This is a special case that only exists for legacy mode.
          // See https://github.com/facebook/react/pull/19216.
          didReceiveUpdate = true;
        } else {
          // An update was scheduled on this fiber, but there are no new props
          // nor legacy context. Set this to false. If an update queue or context
          // consumer produces a changed value, it will set this to true. Otherwise,
          // the component will assume the children have not changed and bail out.
          didReceiveUpdate = false;
        }
      }
    } else {
      didReceiveUpdate = false;
  
      if (getIsHydrating() && isForkedChild(workInProgress)) {
        // Check if this child belongs to a list of muliple children in
        // its parent.
        //
        // In a true multi-threaded implementation, we would render children on
        // parallel threads. This would represent the beginning of a new render
        // thread for this subtree.
        //
        // We only use this for id generation during hydration, which is why the
        // logic is located in this special branch.
        const slotIndex = workInProgress.index;
        const numberOfForks = getForksAtLevel(workInProgress);
        pushTreeId(workInProgress, numberOfForks, slotIndex);
      }
    }
  
    // Before entering the begin phase, clear pending update priority.
    // TODO: This assumes that we're about to evaluate the component and process
    // the update queue. However, there's an exception: SimpleMemoComponent
    // sometimes bails out later in the begin phase. This indicates that we should
    // move this assignment out of the common path and into each branch.
    workInProgress.lanes = NoLanes;
  
    switch (workInProgress.tag) {
      case IndeterminateComponent: {
        return mountIndeterminateComponent(
          current,
          workInProgress,
          workInProgress.type,
          renderLanes,
        );
      }
      case LazyComponent: {
        const elementType = workInProgress.elementType;
        return mountLazyComponent(
          current,
          workInProgress,
          elementType,
          renderLanes,
        );
      }
      case FunctionComponent: {
        const Component = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        const resolvedProps =
          workInProgress.elementType === Component
            ? unresolvedProps
            : resolveDefaultProps(Component, unresolvedProps);
        return updateFunctionComponent(
          current,
          workInProgress,
          Component,
          resolvedProps,
          renderLanes,
        );
      }
      case ClassComponent: {
        const Component = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        const resolvedProps =
          workInProgress.elementType === Component
            ? unresolvedProps
            : resolveDefaultProps(Component, unresolvedProps);
        return updateClassComponent(
          current,
          workInProgress,
          Component,
          resolvedProps,
          renderLanes,
        );
      }
      case HostRoot:
        return updateHostRoot(current, workInProgress, renderLanes);
      case HostHoistable:
        if (enableFloat && supportsResources) {
          return updateHostHoistable(current, workInProgress, renderLanes);
        }
      // Fall through
      case HostSingleton:
        if (supportsSingletons) {
          return updateHostSingleton(current, workInProgress, renderLanes);
        }
      // Fall through
      case HostComponent:
        return updateHostComponent(current, workInProgress, renderLanes);
      case HostText:
        return updateHostText(current, workInProgress);
      case SuspenseComponent:
        return updateSuspenseComponent(current, workInProgress, renderLanes);
      case HostPortal:
        return updatePortalComponent(current, workInProgress, renderLanes);
      case ForwardRef: {
        const type = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        const resolvedProps =
          workInProgress.elementType === type
            ? unresolvedProps
            : resolveDefaultProps(type, unresolvedProps);
        return updateForwardRef(
          current,
          workInProgress,
          type,
          resolvedProps,
          renderLanes,
        );
      }
      case Fragment:
        return updateFragment(current, workInProgress, renderLanes);
      case Mode:
        return updateMode(current, workInProgress, renderLanes);
      case Profiler:
        return updateProfiler(current, workInProgress, renderLanes);
      case ContextProvider:
        return updateContextProvider(current, workInProgress, renderLanes);
      case ContextConsumer:
        return updateContextConsumer(current, workInProgress, renderLanes);
      case MemoComponent: {
        const type = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        // Resolve outer props first, then resolve inner props.
        let resolvedProps = resolveDefaultProps(type, unresolvedProps);
        resolvedProps = resolveDefaultProps(type.type, resolvedProps);
        return updateMemoComponent(
          current,
          workInProgress,
          type,
          resolvedProps,
          renderLanes,
        );
      }
      case SimpleMemoComponent: {
        return updateSimpleMemoComponent(
          current,
          workInProgress,
          workInProgress.type,
          workInProgress.pendingProps,
          renderLanes,
        );
      }
      case IncompleteClassComponent: {
        const Component = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        const resolvedProps =
          workInProgress.elementType === Component
            ? unresolvedProps
            : resolveDefaultProps(Component, unresolvedProps);
        return mountIncompleteClassComponent(
          current,
          workInProgress,
          Component,
          resolvedProps,
          renderLanes,
        );
      }
      case SuspenseListComponent: {
        return updateSuspenseListComponent(current, workInProgress, renderLanes);
      }
      case ScopeComponent: {
        if (enableScopeAPI) {
          return updateScopeComponent(current, workInProgress, renderLanes);
        }
        break;
      }
      case OffscreenComponent: {
        return updateOffscreenComponent(current, workInProgress, renderLanes);
      }
      case LegacyHiddenComponent: {
        if (enableLegacyHidden) {
          return updateLegacyHiddenComponent(
            current,
            workInProgress,
            renderLanes,
          );
        }
        break;
      }
      case CacheComponent: {
        if (enableCache) {
          return updateCacheComponent(current, workInProgress, renderLanes);
        }
        break;
      }
      case TracingMarkerComponent: {
        if (enableTransitionTracing) {
          return updateTracingMarkerComponent(
            current,
            workInProgress,
            renderLanes,
          );
        }
        break;
      }
    }
  
    throw new Error(
      `Unknown unit of work tag (${workInProgress.tag}). This error is likely caused by a bug in ` +
        'React. Please file an issue.',
    );
  }
  
  export {beginWork};