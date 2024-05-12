import numpy as np
import pySequentialLineSearch as pysls


class BayesianOptimizer:
    def __init__(
        self,
        num_suggestions=3,
        num_params=3,
        acquisition_func_type=pysls.AcquisitionFuncType.GaussianProcessUpperConfidenceBound,
        use_map_hyperparams=False,
        ucb_hyperparam=0.50,
    ):
        self.num_suggestions = num_suggestions
        self.suggestions = np.random.rand(num_suggestions, num_params)
        self.optimizer = pysls.PreferentialBayesianOptimizer(
            num_dims=num_params,
            use_map_hyperparams=use_map_hyperparams,
            acquisition_func_type=acquisition_func_type,
            num_options=num_suggestions + 1,
        )
        self.optimizer.set_gaussian_process_upper_confidence_bound_hyperparam(
            ucb_hyperparam
        )

    def suggest_params(self, preferred_option, other_options):
        # Submit the preferential data and update the internal model
        self.optimizer.submit_custom_feedback_data(preferred_option, other_options)

        # Calculate new suggestions
        self.optimizer.determine_next_query()

        # Retrieve the options sampled by Bayesian optimization
        for i in range(self.num_suggestions):
            self.suggestions[i] = self.optimizer.get_current_options()[i + 1]
        return self.suggestions
