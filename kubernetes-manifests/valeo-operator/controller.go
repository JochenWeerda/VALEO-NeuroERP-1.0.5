package controller

import (
	"context"
	"fmt"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/intstr"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
	"sigs.k8s.io/controller-runtime/pkg/source"

	valeov1 "github.com/valeo-neuroerp/valeo-operator/pkg/apis/valeo/v1"
)

var log = logf.Log.WithName("controller_valeoapp")

// Add creates a new ValeoApp Controller and adds it to the Manager.
func Add(mgr manager.Manager) error {
	return add(mgr, newReconciler(mgr))
}

// newReconciler returns a new reconcile.Reconciler
func newReconciler(mgr manager.Manager) reconcile.Reconciler {
	return &ReconcileValeoApp{client: mgr.GetClient(), scheme: mgr.GetScheme()}
}

// add adds a new Controller to mgr with r as the reconcile.Reconciler
func add(mgr manager.Manager, r reconcile.Reconciler) error {
	// Create a new controller
	c, err := controller.New("valeoapp-controller", mgr, controller.Options{Reconciler: r})
	if err != nil {
		return err
	}

	// Watch for changes to primary resource ValeoApp
	err = c.Watch(&source.Kind{Type: &valeov1.ValeoApp{}}, &handler.EnqueueRequestForObject{})
	if err != nil {
		return err
	}

	// Watch for changes to secondary resources and requeue the owner ValeoApp
	err = c.Watch(&source.Kind{Type: &appsv1.Deployment{}}, &handler.EnqueueRequestForOwner{
		IsController: true,
		OwnerType:    &valeov1.ValeoApp{},
	})
	if err != nil {
		return err
	}

	err = c.Watch(&source.Kind{Type: &corev1.Service{}}, &handler.EnqueueRequestForOwner{
		IsController: true,
		OwnerType:    &valeov1.ValeoApp{},
	})
	if err != nil {
		return err
	}

	return nil
}

// ReconcileValeoApp reconciles a ValeoApp object
type ReconcileValeoApp struct {
	// This client, initialized using mgr.Client() above, is a split client
	// that reads objects from the cache and writes to the apiserver
	client client.Client
	scheme *runtime.Scheme
}

// Reconcile reads that state of the cluster for a ValeoApp object and makes changes based on the state read
// and what is in the ValeoApp.Spec
func (r *ReconcileValeoApp) Reconcile(request reconcile.Request) (reconcile.Result, error) {
	reqLogger := log.WithValues("Request.Namespace", request.Namespace, "Request.Name", request.Name)
	reqLogger.Info("Reconciling ValeoApp")

	// Fetch the ValeoApp instance
	instance := &valeov1.ValeoApp{}
	err := r.client.Get(context.TODO(), request.NamespacedName, instance)
	if err != nil {
		if errors.IsNotFound(err) {
			// Request object not found, could have been deleted after reconcile request.
			// Return and don't requeue
			return reconcile.Result{}, nil
		}
		// Error reading the object - requeue the request.
		return reconcile.Result{}, err
	}

	// Define a new Deployment object
	deployment := r.deploymentForValeoApp(instance)

	// Set ValeoApp instance as the owner and controller
	if err := controllerutil.SetControllerReference(instance, deployment, r.scheme); err != nil {
		return reconcile.Result{}, err
	}

	// Check if this Deployment already exists
	found := &appsv1.Deployment{}
	err = r.client.Get(context.TODO(), types.NamespacedName{Name: deployment.Name, Namespace: deployment.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		reqLogger.Info("Creating a new Deployment", "Deployment.Namespace", deployment.Namespace, "Deployment.Name", deployment.Name)
		err = r.client.Create(context.TODO(), deployment)
		if err != nil {
			return reconcile.Result{}, err
		}

		// Deployment created successfully - don't requeue
		return reconcile.Result{}, nil
	} else if err != nil {
		return reconcile.Result{}, err
	}

	// Deployment already exists - check if it needs to be updated
	if deploymentNeedsUpdate(found, deployment) {
		reqLogger.Info("Updating Deployment", "Deployment.Namespace", found.Namespace, "Deployment.Name", found.Name)
		found.Spec = deployment.Spec
		err = r.client.Update(context.TODO(), found)
		if err != nil {
			return reconcile.Result{}, err
		}
	}

	// Define a new Service object
	service := r.serviceForValeoApp(instance)

	// Set ValeoApp instance as the owner and controller
	if err := controllerutil.SetControllerReference(instance, service, r.scheme); err != nil {
		return reconcile.Result{}, err
	}

	// Check if this Service already exists
	foundSvc := &corev1.Service{}
	err = r.client.Get(context.TODO(), types.NamespacedName{Name: service.Name, Namespace: service.Namespace}, foundSvc)
	if err != nil && errors.IsNotFound(err) {
		reqLogger.Info("Creating a new Service", "Service.Namespace", service.Namespace, "Service.Name", service.Name)
		err = r.client.Create(context.TODO(), service)
		if err != nil {
			return reconcile.Result{}, err
		}
	} else if err != nil {
		return reconcile.Result{}, err
	}

	// Update the ValeoApp status with the pod names
	podList := &corev1.PodList{}
	listOpts := []client.ListOption{
		client.InNamespace(instance.Namespace),
		client.MatchingLabels(labelsForValeoApp(instance.Name)),
	}
	err = r.client.List(context.TODO(), podList, listOpts...)
	if err != nil {
		return reconcile.Result{}, err
	}

	// Update status.ReadyReplicas if needed
	readyReplicas := getReadyReplicaCount(podList.Items)
	if instance.Status.ReadyReplicas != readyReplicas {
		instance.Status.ReadyReplicas = readyReplicas
		if readyReplicas == *deployment.Spec.Replicas {
			instance.Status.Phase = "Running"
			instance.Status.Message = "All pods are running"
		} else {
			instance.Status.Phase = "Pending"
			instance.Status.Message = fmt.Sprintf("Waiting for pods (%d/%d ready)", readyReplicas, *deployment.Spec.Replicas)
		}
		err = r.client.Status().Update(context.TODO(), instance)
		if err != nil {
			return reconcile.Result{}, err
		}
	}

	// Requeue to check status periodically
	return reconcile.Result{RequeueAfter: time.Second * 30}, nil
}

// deploymentForValeoApp returns a ValeoApp Deployment object
func (r *ReconcileValeoApp) deploymentForValeoApp(v *valeov1.ValeoApp) *appsv1.Deployment {
	ls := labelsForValeoApp(v.Name)
	replicas := v.Spec.Size

	// Set resource requirements if specified
	resourceRequirements := corev1.ResourceRequirements{}
	if v.Spec.Resources != nil {
		resourceRequirements = *v.Spec.Resources
	}

	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      v.Name,
			Namespace: v.Namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: ls,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: ls,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Image:           v.Spec.Image + ":" + v.Spec.Version,
						Name:            "valeoapp",
						ImagePullPolicy: corev1.PullIfNotPresent,
						Ports: []corev1.ContainerPort{{
							ContainerPort: 8080,
							Name:          "http",
						}},
						Resources: resourceRequirements,
						Env: []corev1.EnvVar{
							{
								Name:  "APP_VERSION",
								Value: v.Spec.Version,
							},
							{
								Name: "POD_NAME",
								ValueFrom: &corev1.EnvVarSource{
									FieldRef: &corev1.ObjectFieldSelector{
										FieldPath: "metadata.name",
									},
								},
							},
							{
								Name: "NAMESPACE",
								ValueFrom: &corev1.EnvVarSource{
									FieldRef: &corev1.ObjectFieldSelector{
										FieldPath: "metadata.namespace",
									},
								},
							},
						},
						LivenessProbe: &corev1.Probe{
							Handler: corev1.Handler{
								HTTPGet: &corev1.HTTPGetAction{
									Path: "/health",
									Port: intstr.FromInt(8080),
								},
							},
							InitialDelaySeconds: 30,
							PeriodSeconds:       10,
							FailureThreshold:    3,
						},
						ReadinessProbe: &corev1.Probe{
							Handler: corev1.Handler{
								HTTPGet: &corev1.HTTPGetAction{
									Path: "/ready",
									Port: intstr.FromInt(8080),
								},
							},
							InitialDelaySeconds: 10,
							PeriodSeconds:       5,
							FailureThreshold:    3,
						},
					}},
				},
			},
		},
	}

	// Set modules as environment variables if specified
	if len(v.Spec.Modules) > 0 {
		for i, module := range v.Spec.Modules {
			dep.Spec.Template.Spec.Containers[0].Env = append(
				dep.Spec.Template.Spec.Containers[0].Env,
				corev1.EnvVar{
					Name:  fmt.Sprintf("MODULE_%d", i),
					Value: module,
				},
			)
		}
		dep.Spec.Template.Spec.Containers[0].Env = append(
			dep.Spec.Template.Spec.Containers[0].Env,
			corev1.EnvVar{
				Name:  "MODULES_ENABLED",
				Value: "true",
			},
		)
	}

	return dep
}

// serviceForValeoApp returns a ValeoApp Service object
func (r *ReconcileValeoApp) serviceForValeoApp(v *valeov1.ValeoApp) *corev1.Service {
	ls := labelsForValeoApp(v.Name)

	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      v.Name,
			Namespace: v.Namespace,
			Labels:    ls,
		},
		Spec: corev1.ServiceSpec{
			Selector: ls,
			Ports: []corev1.ServicePort{
				{
					Port:       8080,
					TargetPort: intstr.FromInt(8080),
					Name:       "http",
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	return svc
}

// labelsForValeoApp returns the labels for selecting the resources
// belonging to the given ValeoApp CR name.
func labelsForValeoApp(name string) map[string]string {
	return map[string]string{
		"app":        "valeoapp",
		"controller": name,
	}
}

// deploymentNeedsUpdate checks if the deployment needs to be updated
func deploymentNeedsUpdate(current, desired *appsv1.Deployment) bool {
	// Check if replicas are different
	if *current.Spec.Replicas != *desired.Spec.Replicas {
		return true
	}

	// Check if container image is different
	if current.Spec.Template.Spec.Containers[0].Image != desired.Spec.Template.Spec.Containers[0].Image {
		return true
	}

	// Check if resource requirements are different
	if !resourcesEqual(current.Spec.Template.Spec.Containers[0].Resources, desired.Spec.Template.Spec.Containers[0].Resources) {
		return true
	}

	return false
}

// resourcesEqual checks if resource requirements are equal
func resourcesEqual(current, desired corev1.ResourceRequirements) bool {
	// Simple equality check for now
	return current.String() == desired.String()
}

// getReadyReplicaCount returns the number of ready replicas
func getReadyReplicaCount(pods []corev1.Pod) int32 {
	var readyReplicas int32 = 0
	for _, pod := range pods {
		if isPodReady(&pod) {
			readyReplicas++
		}
	}
	return readyReplicas
}

// isPodReady returns true if a pod is ready; false otherwise.
func isPodReady(pod *corev1.Pod) bool {
	if pod.Status.Phase != corev1.PodRunning {
		return false
	}
	for _, condition := range pod.Status.Conditions {
		if condition.Type == corev1.PodReady && condition.Status == corev1.ConditionTrue {
			return true
		}
	}
	return false
} 